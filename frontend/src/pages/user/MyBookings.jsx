import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils'; // Make sure this is imported

function MyTabs() {
    return (
        <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                {['Upcoming', 'Past', 'Cancelled'].map((category) => (
                    <Tab
                        key={category}
                        className={({ selected }) =>
                            cn(
                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                selected
                                    ? 'bg-white shadow text-primary'
                                    : 'text-muted-foreground hover:bg-white/[0.12] hover:text-white'
                            )
                        }
                    >
                        {category}
                    </Tab>
                ))}
            </Tab.List>
            {/* Panels would go here */}
        </Tab.Group>
    )
}

// Since I am supposed to be quick, I'll use a simpler state-based tab for now to match specific styling needs easily.
import { useState } from 'react';

export default function MyBookings() {
    const [activeTab, setActiveTab] = useState('upcoming');

    const bookings = [
        { id: 1, resource: 'Meeting Room A', date: '2024-12-25', time: '10:00 - 11:00', status: 'upcoming' },
        { id: 2, resource: 'Projector', date: '2024-12-20', time: '14:00 - 15:00', status: 'past' },
        { id: 3, resource: 'Conference Hall', date: '2024-12-28', time: '09:00 - 12:00', status: 'cancelled' },
    ];

    const filteredBookings = bookings.filter(b =>
        activeTab === 'upcoming' ? b.status === 'upcoming' :
            activeTab === 'past' ? b.status === 'past' :
                b.status === 'cancelled'
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
            </div>

            {/* Custom Tabs */}
            <div className="flex space-x-2 border-b">
                {['upcoming', 'past', 'cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px capitalize",
                            activeTab === tab
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No bookings found in this category.
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{booking.resource}</CardTitle>
                                        <CardDescription>{booking.date} | {booking.time}</CardDescription>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                        booking.status === 'upcoming' && "bg-blue-100 text-blue-700",
                                        booking.status === 'past' && "bg-gray-100 text-gray-700",
                                        booking.status === 'cancelled' && "bg-red-100 text-red-700",
                                    )}>
                                        {booking.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 justify-end">
                                    {booking.status === 'upcoming' && (
                                        <>
                                            <Button variant="outline" size="sm">Reschedule</Button>
                                            <Button variant="destructive" size="sm">Cancel</Button>
                                        </>
                                    )}
                                    {booking.status === 'past' && (
                                        <Button variant="outline" size="sm">Book Again</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
