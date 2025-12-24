import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Calendar, Clock, Loader2, MapPin } from 'lucide-react';
import api from '../../lib/api';
import { format, parseISO } from 'date-fns';

export default function MyBookings() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings');
                setBookings(res.data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Filter logic
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const filteredBookings = safeBookings.filter(b => {
        if (!b || !b.start_time) return false;
        try {
            const bookingDate = new Date(b.start_time);
            const now = new Date();
            const isPast = bookingDate < now;
            const isCancelled = b.status === 'cancelled';

            if (activeTab === 'cancelled') return isCancelled;
            if (activeTab === 'past') return isPast && !isCancelled;
            if (activeTab === 'upcoming') return !isPast && !isCancelled;
            return true;
        } catch (e) {
            console.error("Invalid booking date", b);
            return false;
        }
    });

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

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

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
                        <p>No {activeTab} bookings found.</p>
                        {activeTab === 'upcoming' && (
                            <Button variant="link" className="mt-2 text-primary">Book a resource now</Button>
                        )}
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card key={booking.id} className="transition-all hover:shadow-md border-muted">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{booking.resource_name || 'Resource'}</CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {booking.resource_type || 'Room'}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize",
                                        activeTab === 'upcoming' && "bg-blue-100 text-blue-700",
                                        activeTab === 'past' && "bg-gray-100 text-gray-700",
                                        booking.status === 'cancelled' && "bg-red-100 text-red-700",
                                    )}>
                                        {booking.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{format(parseISO(booking.start_time), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{format(parseISO(booking.start_time), 'h:mm a')} - {format(parseISO(booking.end_time), 'h:mm a')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-2 border-t">
                                    {activeTab === 'upcoming' && (
                                        <>
                                            <Button variant="outline" size="sm">Reschedule</Button>
                                            <Button variant="destructive" size="sm">Cancel</Button>
                                        </>
                                    )}
                                    {activeTab === 'past' && (
                                        <Button variant="secondary" size="sm" className="w-full">Book Again</Button>
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
