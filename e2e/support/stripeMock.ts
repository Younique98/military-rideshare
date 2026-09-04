import type { Page } from '@playwright/test'

/**
 * Test-mode Stripe mock — no real Stripe network calls, no real
 * credentials, per the "don't hit live payment infra in CI" instruction.
 *
 * How it works: @stripe/stripe-js's loadStripe() checks for an existing
 * `window.Stripe` global before injecting <script src="https://js.stripe.com/...">
 * (see node_modules/@stripe/stripe-js/dist/index.js, loadScript()) — if
 * it's already there, it uses that directly and never touches the network.
 * This installs a minimal fake `window.Stripe` factory, before any app code
 * runs, that satisfies @stripe/react-stripe-js's isStripe() shape check
 * (elements/createToken/createPaymentMethod/confirmCardPayment all being
 * functions) and implements just enough of `elements()` /
 * `elements.create('payment')` / `element.mount()` / `stripe.confirmPayment()`
 * for RidePaymentForm.tsx to render and complete a simulated payment.
 *
 * Pair this with routing /api/stripe/payment/create-intent to a fixture
 * response (see mockCreateIntentRoute below) — this mock never talks to
 * real Stripe, and the app's own server route is never asked to create a
 * real PaymentIntent either.
 */
export async function installStripeMock(page: Page) {
    await page.addInitScript(() => {
        function createFakePaymentElement() {
            let mounted: HTMLElement | null = null
            return {
                mount(target: string | HTMLElement) {
                    const node =
                        typeof target === 'string'
                            ? document.querySelector(target)
                            : target
                    if (!node) return
                    const wrapper = document.createElement('div')
                    wrapper.setAttribute('data-testid', 'mock-payment-element')
                    wrapper.style.border = '1px solid #d1d5db'
                    wrapper.style.borderRadius = '8px'
                    wrapper.style.padding = '12px'

                    const label = document.createElement('label')
                    label.setAttribute('for', 'mock-card-number')
                    label.textContent = 'Card number'
                    wrapper.appendChild(label)

                    const input = document.createElement('input')
                    input.id = 'mock-card-number'
                    input.type = 'text'
                    input.placeholder = '4242 4242 4242 4242'
                    input.defaultValue = '4242 4242 4242 4242'
                    input.style.display = 'block'
                    input.style.width = '100%'
                    input.style.marginTop = '4px'
                    input.style.padding = '8px'
                    wrapper.appendChild(input)

                    node.appendChild(wrapper)
                    mounted = wrapper
                },
                unmount() {
                    mounted?.remove()
                    mounted = null
                },
                destroy() {
                    mounted?.remove()
                    mounted = null
                },
                on() {
                    /* no-op: RidePaymentForm's <PaymentElement /> passes no
                       event-handler props, so real Stripe.js never calls
                       these either in this app's usage. */
                },
                off() {},
                update() {},
            }
        }

        function createFakeElements() {
            return {
                create(_type: string) {
                    return createFakePaymentElement()
                },
                getElement() {
                    return null
                },
                update() {},
            }
        }

        const fakeStripe = {
            elements() {
                return createFakeElements()
            },
            // Shape-check functions used by @stripe/react-stripe-js's
            // isStripe() — never actually invoked by this app's code.
            createToken() {
                return Promise.resolve({})
            },
            createPaymentMethod() {
                return Promise.resolve({})
            },
            confirmCardPayment() {
                return Promise.resolve({})
            },
            // The one Stripe method RidePaymentForm.tsx actually calls.
            // Simulates a successful confirmation after a short, real delay
            // so the "Processing…" submit-button state is genuinely
            // observable (and screenshot-able) rather than skipped.
            confirmPayment() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            paymentIntent: {
                                status: 'succeeded',
                                id: 'pi_mock_test',
                            },
                        })
                    }, 300)
                })
            },
            _registerWrapper() {},
            registerAppInfo() {},
        }
        // @ts-expect-error test-only global
        window.Stripe = () => fakeStripe
    })
}

/**
 * Intercepts POST /api/stripe/payment/create-intent and returns a fixture
 * clientSecret instead of letting the request reach the real Next.js route
 * (which would otherwise need a real STRIPE_SECRET_KEY to call Stripe's
 * API). The clientSecret's shape (`pi_..._secret_...`) matches what a real
 * PaymentIntent looks like, but it is never sent anywhere — the mocked
 * `stripe.confirmPayment()` above never validates or transmits it.
 */
export async function mockCreateIntentRoute(page: Page) {
    await page.route('**/api/stripe/payment/create-intent', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                clientSecret: 'pi_mock_test_secret_abc123',
                paymentIntentId: 'pi_mock_test',
            }),
        })
    })
}
