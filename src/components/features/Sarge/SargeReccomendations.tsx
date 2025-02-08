import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip'
import Image from 'next/image'

export const SargeRecommendations = () => {
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

            <ScrollArea className="h-48">
                <div className="flex space-x-4">
                    {recommendations.map((rec, index) => (
                        <Card key={index} className="w-64">
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
                                <Button className="mt-2 w-full">Select</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <p className="mt-4 text-sm text-blue-500 cursor-pointer">
                            How does Sarge work?
                        </p>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            Sarge suggests locations based on places you&apos;ve
                            visited and rated. The more you interact, the
                            smarter the recommendations become!
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
