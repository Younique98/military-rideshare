import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'
import Image from 'next/image'

export const SargeRecommendations = () => {
    const [tooltipVisible, setTooltipVisible] = useState(false)

    const recommendations = [
        {
            name: 'Central Park',
            description: 'A great place for a walk and relaxation.',
            address: '123 Main St, Anywhere, NC',
            image: '/images/locations/flowers-by-sabine (1).jpg',
        },
        {
            name: 'Local Bistro',
            description: 'Rated highly for its cozy ambiance.',
            address: '456 Foodie Ln, Anywhere, NC',
            image: '/images/locations/coffee-shop-by-wal_172619 (1).jpg',
        },
        {
            name: 'Tech Hub',
            description: 'Coworking space with great reviews.',
            address: '789 Innovation Dr, Anywhere, NC',
            image: '/images/locations/seoul-by-stephen-park (1).jpg',
        },
    ]

    const handleSelect = (rec: {
        name: string
        description?: string
        address?: string
        image?: string
    }) => {
        console.log(`Selected: ${rec.name}`)

        // TODO: (ET) Add logic here for what happens when a card is selected.
    }

    return (
        <div className="p-4">
            <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                    <AvatarImage
                        src="/images/avatars/avatar_sarge_no_bg.jpg"
                        alt="Sarge Avatar"
                        width={40}
                        height={40}
                    />
                    <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-bold">Sarge Recommends</h3>
                    <p className="text-sm text-gray-500">
                        Based on your travel history and ratings.
                    </p>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, index) => (
                        <Card
                            key={index}
                            className="w-full cursor-pointer hover:shadow-lg transition-shadow hover:scale-105 transform hover:ring-4 hover:ring-accent"
                            onClick={() => handleSelect(rec)}
                        >
                            <Image
                                src={rec.image}
                                alt={rec.name}
                                width={256}
                                height={128}
                                className="w-full h-32 object-cover rounded-t"
                            />
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-md">
                                    {rec.name}
                                </h4>
                                <p className="text-sm text-gray-500 mb-2">
                                    {rec.description}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {rec.address}
                                </p>
                                {/* <Button className="mt-2 w-full">Select</Button> */}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <p
                        className="mt-4 text-sm text-blue-500 cursor-pointer"
                        onClick={() => setTooltipVisible(!tooltipVisible)}
                    >
                        How does Sarge work?
                    </p>
                    {tooltipVisible && (
                        <div
                            className="absolute z-10 mt-2 p-4 bg-white text-black rounded-md shadow-lg max-w-xs w-full sm:max-w-sm"
                            style={{
                                transition: 'opacity 0.3s ease',
                                opacity: 1,
                            }}
                            onClick={() => setTooltipVisible(false)}
                        >
                            <p>
                                Sarge suggests locations based on places
                                you&apos;ve visited and rated. The more you
                                interact, the smarter the recommendations
                                become!
                            </p>
                        </div>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
