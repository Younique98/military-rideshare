const {
    initializeTestEnvironment,
    assertFails,
    assertSucceeds,
} = require('@firebase/rules-unit-testing')
const fs = require('fs')
const path = require('path')
const {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
} = require('firebase/firestore')

let testEnv
let pass = 0
let fail = 0
const failures = []

async function check(name, fn) {
    try {
        await fn()
        pass++
        console.log(`PASS: ${name}`)
    } catch (err) {
        fail++
        failures.push({ name, err: err.message })
        console.log(`FAIL: ${name} -- ${err.message}`)
    }
}

async function main() {
    testEnv = await initializeTestEnvironment({
        projectId: 'demo-baselink',
        firestore: {
            rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
            host: '127.0.0.1',
            port: 8080,
        },
    })

    const rider = () => testEnv.authenticatedContext('rider1').firestore()
    const otherRider = () => testEnv.authenticatedContext('rider2').firestore()
    const driver = () => testEnv.authenticatedContext('driver1').firestore()
    const otherDriver = () => testEnv.authenticatedContext('driver2').firestore()
    const unonboardedDriver = () => testEnv.authenticatedContext('driver3').firestore()
    const unauth = () => testEnv.unauthenticatedContext().firestore()

    // --- Seed onboarded/unonboarded driver profiles via admin bypass ---
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore()
        await setDoc(doc(db, 'users', 'driver1'), {
            stripeConnectedAccountId: 'acct_driver1',
            stripeOnboardingComplete: true,
        })
        await setDoc(doc(db, 'users', 'driver2'), {
            stripeConnectedAccountId: 'acct_driver2',
            stripeOnboardingComplete: true,
        })
        await setDoc(doc(db, 'users', 'driver3'), {
            stripeConnectedAccountId: 'acct_driver3',
            stripeOnboardingComplete: false,
        })
    })

    // ===================== users/{uid} =====================
    await check('user cannot self-create with stripeOnboardingComplete=true', async () => {
        await assertFails(
            setDoc(doc(rider(), 'users', 'rider1'), {
                stripeOnboardingComplete: true,
                stripeConnectedAccountId: 'acct_fake',
            })
        )
    })

    await check('user can self-create clean profile', async () => {
        await assertSucceeds(
            setDoc(doc(rider(), 'users', 'rider1'), {
                name: 'Rider One',
            })
        )
    })

    await check('user cannot self-set stripeOnboardingComplete via update', async () => {
        await assertFails(
            updateDoc(doc(driver(), 'users', 'driver1'), {
                stripeOnboardingComplete: false, // trying to escalate/downgrade themselves
            })
        )
    })

    await check('user cannot self-set stripeConnectedAccountId via update', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'users', 'rider1'), {
                stripeConnectedAccountId: 'acct_selfgranted',
            })
        )
    })

    await check('unonboarded driver cannot grant self onboarding via update', async () => {
        await assertFails(
            updateDoc(doc(unonboardedDriver(), 'users', 'driver3'), {
                stripeOnboardingComplete: true,
            })
        )
    })

    // ===================== rides/{rideId} create =====================
    let rideId
    await check('rider can create a valid REQUESTED ride for themselves', async () => {
        const ref = await assertSucceeds(
            addDoc(collection(rider(), 'rides'), {
                riderId: 'rider1',
                driverId: null,
                status: 'REQUESTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 1500,
                currency: 'usd',
                requestedAt: serverTimestamp(),
            })
        )
        rideId = ref.id
    })

    await check('rider cannot create a ride impersonating another rider', async () => {
        await assertFails(
            addDoc(collection(rider(), 'rides'), {
                riderId: 'rider2',
                driverId: null,
                status: 'REQUESTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 1500,
                currency: 'usd',
                requestedAt: serverTimestamp(),
            })
        )
    })

    await check('rider cannot create a ride pre-set to ACCEPTED', async () => {
        await assertFails(
            addDoc(collection(rider(), 'rides'), {
                riderId: 'rider1',
                driverId: 'driver1',
                status: 'ACCEPTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 1500,
                currency: 'usd',
                requestedAt: serverTimestamp(),
            })
        )
    })

    await check('rider cannot create a ride with payment data attached', async () => {
        await assertFails(
            addDoc(collection(rider(), 'rides'), {
                riderId: 'rider1',
                driverId: null,
                status: 'REQUESTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 1500,
                currency: 'usd',
                requestedAt: serverTimestamp(),
                payment: { status: 'succeeded' },
            })
        )
    })

    await check('rider cannot create a ride with zero/negative fare', async () => {
        await assertFails(
            addDoc(collection(rider(), 'rides'), {
                riderId: 'rider1',
                driverId: null,
                status: 'REQUESTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 0,
                currency: 'usd',
                requestedAt: serverTimestamp(),
            })
        )
    })

    // ===================== rides/{rideId} read scoping =====================
    await check('unonboarded driver cannot see the open REQUESTED queue', async () => {
        await assertFails(getDoc(doc(unonboardedDriver(), 'rides', rideId)))
    })

    await check('onboarded driver CAN see an open REQUESTED ride', async () => {
        await assertSucceeds(getDoc(doc(driver(), 'rides', rideId)))
    })

    await check('unrelated rider cannot read another rider\'s ride', async () => {
        await assertFails(getDoc(doc(otherRider(), 'rides', rideId)))
    })

    await check('unauthenticated cannot read a ride', async () => {
        await assertFails(getDoc(doc(unauth(), 'rides', rideId)))
    })

    // ===================== fare/payment immutability =====================
    await check('client cannot alter fare on update (even during a legal transition)', async () => {
        await assertFails(
            updateDoc(doc(driver(), 'rides', rideId), {
                status: 'ACCEPTED',
                driverId: 'driver1',
                fare: 999999,
            })
        )
    })

    await check('client cannot directly write ride status to PAID', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'rides', rideId), {
                status: 'PAID',
            })
        )
    })

    await check('client cannot write .payment on a ride update', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'rides', rideId), {
                payment: { status: 'succeeded', stripePaymentIntentId: 'pi_fake' },
            })
        )
    })

    await check('unonboarded driver cannot accept a ride', async () => {
        await assertFails(
            updateDoc(doc(unonboardedDriver(), 'rides', rideId), {
                status: 'ACCEPTED',
                driverId: 'driver3',
            })
        )
    })

    await check('onboarded driver CAN accept an open ride', async () => {
        await assertSucceeds(
            updateDoc(doc(driver(), 'rides', rideId), {
                status: 'ACCEPTED',
                driverId: 'driver1',
            })
        )
    })

    await check('a different onboarded driver cannot steal an already-accepted ride', async () => {
        await assertFails(
            updateDoc(doc(otherDriver(), 'rides', rideId), {
                status: 'ACCEPTED',
                driverId: 'driver2',
            })
        )
    })

    await check('a different driver cannot advance a ride that is not theirs', async () => {
        await assertFails(
            updateDoc(doc(otherDriver(), 'rides', rideId), {
                status: 'IN_PROGRESS',
            })
        )
    })

    await check('assigned driver CAN start the trip', async () => {
        await assertSucceeds(
            updateDoc(doc(driver(), 'rides', rideId), {
                status: 'IN_PROGRESS',
            })
        )
    })

    await check('rider cannot skip straight from IN_PROGRESS to PAID', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'rides', rideId), {
                status: 'PAID',
            })
        )
    })

    await check('assigned driver CAN complete the trip', async () => {
        await assertSucceeds(
            updateDoc(doc(driver(), 'rides', rideId), {
                status: 'COMPLETED',
            })
        )
    })

    await check('client cannot move a COMPLETED ride to PAID themselves', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'rides', rideId), {
                status: 'PAID',
            })
        )
        await assertFails(
            updateDoc(doc(driver(), 'rides', rideId), {
                status: 'PAID',
            })
        )
    })

    await check('rider cannot re-open a COMPLETED ride back to REQUESTED', async () => {
        await assertFails(
            updateDoc(doc(rider(), 'rides', rideId), {
                status: 'REQUESTED',
            })
        )
    })

    await check('admin SDK (rules bypass) CAN move ride to PAID -- the only legitimate path', async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await assertSucceeds(
                updateDoc(doc(ctx.firestore(), 'rides', rideId), {
                    status: 'PAID',
                    'payment.status': 'succeeded',
                })
            )
        })
    })

    // ===================== cancellation =====================
    let cancelRideId
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const ref = doc(ctx.firestore(), 'rides', 'cancel-test-ride')
        await setDoc(ref, {
            riderId: 'rider1',
            driverId: null,
            status: 'REQUESTED',
            pickup: { address: 'A' },
            dropoff: { address: 'B' },
            fare: 1500,
            currency: 'usd',
            requestedAt: serverTimestamp(),
        })
        cancelRideId = ref.id
    })

    await check('rider can cancel their own REQUESTED ride', async () => {
        await assertSucceeds(
            updateDoc(doc(rider(), 'rides', cancelRideId), {
                status: 'CANCELLED',
                cancelledBy: 'rider',
            })
        )
    })

    await check('an unrelated user cannot cancel someone else\'s ride', async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'rides', 'cancel-test-2'), {
                riderId: 'rider1',
                driverId: null,
                status: 'REQUESTED',
                pickup: { address: 'A' },
                dropoff: { address: 'B' },
                fare: 1500,
                currency: 'usd',
                requestedAt: serverTimestamp(),
            })
        })
        await assertFails(
            updateDoc(doc(otherRider(), 'rides', 'cancel-test-2'), {
                status: 'CANCELLED',
                cancelledBy: 'rider',
            })
        )
    })

    // ===================== deletes =====================
    await check('rider cannot delete their own ride', async () => {
        const { deleteDoc } = require('firebase/firestore')
        await assertFails(deleteDoc(doc(rider(), 'rides', cancelRideId)))
    })

    // ===================== waitlist =====================
    await check('user can create their own waitlist signup', async () => {
        await assertSucceeds(
            addDoc(collection(rider(), 'waitlist'), {
                userId: 'rider1',
                email: 'rider1@example.com',
            })
        )
    })

    await check('user cannot create a waitlist signup for someone else', async () => {
        await assertFails(
            addDoc(collection(rider(), 'waitlist'), {
                userId: 'rider2',
                email: 'rider1@example.com',
            })
        )
    })

    console.log(`\n${pass}/${pass + fail} tests passed`)
    if (fail > 0) {
        console.log('\nFailures:')
        for (const f of failures) console.log(`  - ${f.name}: ${f.err}`)
    }

    await testEnv.cleanup()
    process.exit(fail > 0 ? 1 : 0)
}

main().catch((err) => {
    console.error('FATAL:', err)
    process.exit(1)
})
