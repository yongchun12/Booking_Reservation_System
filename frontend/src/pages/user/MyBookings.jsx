import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ui/confirm-modal';
import { toast } from 'sonner';

export default function MyBookings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cancel Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

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

    const handleReschedule = (booking) => {
        // Navigate to NewBooking with pre-filled details
        navigate('/new-booking', {
            state: {
                resourceId: booking.resource_id,
                resourceName: booking.resource_name,
                // Optional: Pass dates if we want to pre-fill them too
                // date: booking.booking_date
            }
        });
    };

    const handleCancelClick = (booking) => {
        setBookingToCancel(booking);
        setCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;
        setCancelling(true);
        try {
            await api.delete(`/bookings/${bookingToCancel.id}`);
            // Optimistic update or refetch
            setBookings(prev => prev.map(b => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b));
            toast.success("Booking cancelled successfully");
            setCancelModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel booking");
        } finally {
            setCancelling(false);
        }
    };

    // Helper to generate ICS file content
    const generateICS = (booking, startDateTime, endDateTime) => {
        if (!startDateTime || !endDateTime) return;

        const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Booking System//User//EN",
            "BEGIN:VEVENT",
            `UID:${booking.id}@bookingsystem.com`,
            `DTSTAMP:${formatDate(new Date())}`,
            `DTSTART:${formatDate(startDateTime)}`,
            `DTEND:${formatDate(endDateTime)}`,
            `SUMMARY:Booking: ${booking.resource_name}`,
            `DESCRIPTION:Notes: ${booking.notes || 'No notes'}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `booking_${booking.id}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ... (rest of helper functions same as before) ...
    const getBookingDateTime = (booking, timeStr) => {
        if (!booking.booking_date || !timeStr) return null;
        try {
            const dateStr = booking.booking_date.includes('T') ? booking.booking_date.split('T')[0] : booking.booking_date;
            return new Date(`${dateStr}T${timeStr}`);
        } catch (e) {
            console.error("Date parse error", e);
            return null;
        }
    };

    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const filteredBookings = safeBookings.filter(b => {
        const startDateTime = getBookingDateTime(b, b.start_time);
        if (!startDateTime || !isValid(startDateTime)) return false;

        const isExpired = isPast(startDateTime);
        const isCancelled = b.status === 'cancelled';

        if (activeTab === 'cancelled') return isCancelled;
        if (activeTab === 'past') return isExpired && !isCancelled;
        if (activeTab === 'upcoming') return !isExpired && !isCancelled;
        return true;
    });

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Cancel Booking"
                message={`Are you sure you want to cancel your booking for ${bookingToCancel?.resource_name}?`}
                onConfirm={confirmCancel}
                isLoading={cancelling}
            />

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
                            <Button variant="link" className="mt-2 text-primary" onClick={() => navigate('/new-booking')}>Book a resource now</Button>
                        )}
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const startDateTime = getBookingDateTime(booking, booking.start_time);
                        const endDateTime = getBookingDateTime(booking, booking.end_time);

                        return (
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
                                            <span className="font-medium">
                                                {isValid(startDateTime) ? format(startDateTime, 'MMM d, yyyy') : 'Invalid Date'}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {isValid(startDateTime) ? format(startDateTime, 'h:mm a') : '--'} -
                                                {isValid(endDateTime) ? format(endDateTime, 'h:mm a') : '--'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t">
                                        {activeTab === 'upcoming' && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => generateICS(booking, startDateTime, endDateTime)}>
                                                    ICS
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleReschedule(booking)}>
                                                    Reschedule
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleCancelClick(booking)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {activeTab === 'past' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleReschedule(booking)}
                                            >
                                                Book Again
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
