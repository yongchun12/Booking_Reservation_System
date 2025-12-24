import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user } = useAuth();

    // Fetch Bookings
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/bookings');
            // Transform API data to FullCalendar format
            const calendarEvents = res.data.map(booking => ({
                id: booking.id,
                title: booking.resource_name || 'Booking', // Assuming backend joins request
                start: `${booking.booking_date.split('T')[0]}T${booking.start_time}`,
                end: `${booking.booking_date.split('T')[0]}T${booking.end_time}`,
                backgroundColor: booking.status === 'confirmed' ? '#10b981' : '#6366f1',
                extendedProps: { ...booking }
            }));
            setEvents(calendarEvents);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        }
    };

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo);
        setNewEventTitle('');
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setNewEventTitle(clickInfo.event.title);
        setShowModal(true);
    };

    const handleSaveEvent = async () => {
        if (!newEventTitle || !selectedDate) return;

        // Simplified booking creation: Just defaults to a specific resource for now (MVP)
        // Ideally we need a Resource Select input in the modal
        // Using Resource ID 1 (Meeting Room A) as default
        const payload = {
            resource_id: 1,
            booking_date: selectedDate.startStr.split('T')[0],
            start_time: selectedDate.startStr.split('T')[1].substring(0, 5), // HH:MM
            end_time: selectedDate.endStr.split('T')[1].substring(0, 5)     // HH:MM
        };

        try {
            await api.post('/bookings', payload);
            await fetchEvents(); // Refresh
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await api.delete(`/bookings/${selectedEvent.id}`);
            await fetchEvents();
            setShowModal(false);
        } catch (err) {
            alert("Failed to delete booking");
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
                    <div className="h-[600px] [&_.fc-theme-standard_td]:border-border [&_.fc-theme-standard_th]:border-border">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            initialView="timeGridWeek"
                            editable={false} // Disable drag-resize for now to keep simple
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events} // Use dynamic events
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            height="100%"
                        />
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
                    <div className="flex justify-end gap-2 pt-2">
                        {selectedEvent && (
                            <Button variant="destructive" onClick={handleDeleteEvent}>
                                Delete
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEvent}>
                            {selectedEvent ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
