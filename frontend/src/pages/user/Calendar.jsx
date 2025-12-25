import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import ConfirmModal from '../../components/ui/confirm-modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { DatePicker } from '../../components/ui/date-picker';
import { TimeSelect } from '../../components/ui/time-select';
import { format } from 'date-fns';

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user } = useAuth();

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // RSVP Handler
    const handleRSVP = async (status) => {
        if (!selectedEvent) return;
        try {
            await api.put(`/bookings/${selectedEvent.id}/rsvp`, { status });
            toast.success(`You have ${status} this invitation.`);
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || "RSVP failed");
        }
    };

    // Fetch Bookings
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/bookings');
            // Transform API data to FullCalendar format
            const calendarEvents = res.data.map(booking => {
                // Safe date string extraction
                let dateStr;
                if (booking.booking_date) {
                    dateStr = booking.booking_date.toString().includes('T')
                        ? booking.booking_date.toString().split('T')[0]
                        : booking.booking_date.toString();
                } else {
                    return null; // Skip invalid
                }

                return {
                    id: booking.id,
                    title: booking.notes || booking.resource_name || 'Booking',
                    start: `${dateStr}T${booking.start_time}`,
                    end: `${dateStr}T${booking.end_time}`,
                    backgroundColor: booking.status === 'confirmed' ? '#10b981' : '#6366f1',
                    extendedProps: {
                        ...booking,
                        user_id: booking.user_id, // Ensure user_id is present
                        is_owner: booking.user_id === user?.id,
                        attendees: booking.attendees || []
                    }
                };
            }).filter(Boolean);
            setEvents(calendarEvents);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    };

    const handleDateSelect = (selectInfo) => {
        // FullCalendar returns ISO string "YYYY-MM-DD"
        // Adjust for timezone offset if necessary, but usually raw string is fine for date-picker

        // We need to parse this into a Date object for DatePicker, or keep as string
        // DatePicker expects a Date object
        const d = new Date(selectInfo.startStr);

        setSelectedDate({ startStr: selectInfo.startStr }); // Keep for internal logic if needed
        // But mainly we need to set a state that DatePicker reads.
        // Let's create a 'formDate' state separate from 'selectedDate' object to simplify
        // Actually let's just use 'selectedDate' as the Date object itself.

        // REFACTOR: simplify state.
        // selectedDate will now be a Date object.
        setSelectedDate(d);

        setNewEventTitle('');
        // Extract time from selection
        const startStr = selectInfo.startStr.includes('T') ? selectInfo.startStr.split('T')[1].substring(0, 5) : '09:00';
        const endStr = selectInfo.endStr.includes('T') ? selectInfo.endStr.split('T')[1].substring(0, 5) : '10:00';

        // If it's an all-day click (month view), defaults to 09:00-10:00
        setTimeRange({ start: startStr === '00:00' ? '09:00' : startStr, end: endStr === '00:00' ? '10:00' : endStr });

        setSelectedEvent(null);
        // Also reset delete modal state just in case
        setDeleteModalOpen(false);
        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
        const e = clickInfo.event;
        setSelectedEvent(e);
        setNewEventTitle(e.title);

        // Populate times
        const startStr = e.start.toTimeString().substring(0, 5);
        const endStr = e.end ? e.end.toTimeString().substring(0, 5) : startStr;
        setTimeRange({ start: startStr, end: endStr });

        // Set Date object
        setSelectedDate(e.start);

        setDeleteModalOpen(false);
        setShowModal(true);
    };

    const handleSaveEvent = async () => {
        if (!newEventTitle || !selectedDate) return;

        // Simplified booking creation
        const payload = {
            resource_id: 1, // Defaulting to 1 for calendar quick-add
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: timeRange.start, // HH:MM from input
            end_time: timeRange.end,     // HH:MM from input
            notes: newEventTitle
        };

        try {
            if (selectedEvent) {
                // Reschedule / Update
                await api.put(`/bookings/${selectedEvent.id}`, payload);
                toast.success("Event updated");
            } else {
                // Create new
                await api.post('/bookings', payload);
                toast.success("Event created");
            }

            await fetchEvents();
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedEvent) return;
        setDeleting(true);

        try {
            await api.delete(`/bookings/${selectedEvent.id}`);
            await fetchEvents();
            setDeleteModalOpen(false);
            setShowModal(false);
            toast.success("Booking cancelled");
        } catch (err) {
            toast.error("Failed to delete booking");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Booking Calendar</h2>
                <Button onClick={fetchEvents}>Refresh</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[800px] [&_.fc-theme-standard_td]:border-border [&_.fc-theme-standard_th]:border-border">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            initialView="timeGridWeek"
                            editable={false}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            height="100%"
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                            <span>Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                            <span>Pending / Other</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedEvent ? "Edit Event" : "Create Booking"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title / Purpose</Label>
                        <Input
                            id="title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="e.g. Team Meeting"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <DatePicker
                            date={selectedDate}
                            setDate={setSelectedDate}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <TimeSelect
                                value={timeRange.start}
                                onChange={(v) => setTimeRange({ ...timeRange, start: v })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <TimeSelect
                                value={timeRange.end}
                                onChange={(v) => setTimeRange({ ...timeRange, end: v })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* RSVP Section in Modal */}
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Attendees</h4>
                        <div className="space-y-2 mb-4">
                            {selectedEvent?.extendedProps?.attendees?.length > 0 ? (
                                selectedEvent.extendedProps.attendees.map(att => (
                                    <div key={att.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                                        <span>{att.name}</span>
                                        <span className={cn(
                                            "uppercase text-xs font-bold px-2 py-1 rounded",
                                            att.status === 'accepted' ? "bg-green-100 text-green-700" :
                                                att.status === 'declined' ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {att.status || 'Pending'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No attendees invited.</p>
                            )}
                        </div>

                        {/* RSVP Actions (Only if I am an attendee) */}
                        {!selectedEvent?.extendedProps?.is_owner && selectedEvent && (
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-medium">Your Response:</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRSVP('declined')}>Decline</Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRSVP('accepted')}>Accept</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        {selectedEvent?.extendedProps?.is_owner && selectedEvent?.extendedProps?.status !== 'cancelled' && (
                            <Button variant="destructive" onClick={handleDeleteClick}>
                                Cancel Booking
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        {(!selectedEvent || (selectedEvent.extendedProps?.is_owner && selectedEvent.extendedProps?.status !== 'cancelled')) && (
                            <Button onClick={handleSaveEvent}>
                                {selectedEvent ? 'Update Event' : 'Create Booking'}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking/event?"
                confirmText="Yes, Cancel"
                isLoading={deleting}
            />
        </div>
    );
}
