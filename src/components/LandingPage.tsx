'use client'
import React, { useState } from 'react'
import { AlertCircle, Check, MapPin, Shield, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Image from 'next/image'

const LandingPage = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ type: '', message: '' })

    const features = [
        {
            icon: <Shield className="w-6 h-6 text-blue-600" />,
            title: 'Military Verified',
            description:
                'Secure rides with ID.me verified service members and dependents only',
        },
        {
            icon: <MapPin className="w-6 h-6 text-blue-600" />,
            title: 'Base-to-Base',
            description:
                'Convenient rides between military installations and nearby locations',
        },
        {
            icon: <Users className="w-6 h-6 text-blue-600" />,
            title: 'Military Community',
            description:
                'Connect with fellow service members for reliable transportation',
        },
    ]

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        // Simulate API call
        setStatus({
            type: 'success',
            message: "Thanks for joining our waitlist! We'll be in touch soon.",
        })
        setEmail('')
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-22 sm:py-38 lg:py-54">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Military Rideshare Made Simple
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Secure, verified rides exclusively for service
                            members and their families. Skip the wait for base
                            taxis and connect with your military community.
                        </p>

                        {/* Waitlist Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="mt-10 flex max-w-md mx-auto gap-x-4"
                        >
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Join Waitlist
                            </button>
                        </form>

                        {/* Status Message */}
                        {status.type && (
                            <div className="mt-4">
                                <Alert
                                    variant={
                                        status.type === 'success'
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    <AlertTitle>
                                        {status.type === 'success' ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                    </AlertTitle>
                                    <AlertDescription>
                                        {status.message}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 sm:py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">
                            Exclusive Military Community
                        </h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need for secure rides
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Built specifically for military members and their
                            families, our platform ensures safe and reliable
                            transportation within the military community.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="relative pl-16"
                                >
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                            {feature.icon}
                                        </div>
                                        {feature.title}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">
                                        {feature.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* App Preview Section */}
            <div className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">
                            Coming Soon
                        </h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Preview the Experience
                        </p>
                    </div>
                    <div className="mt-16 flow-root sm:mt-24">
                        <div className="relative rounded-xl bg-gray-900/5 p-2">
                            <div className="flex justify-center">
                                <Image
                                    src="/images/map/map_of_vegas.png"
                                    alt="Base Link map view showing available rides near a military installation"
                                    width={280}
                                    height={560}
                                    className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
