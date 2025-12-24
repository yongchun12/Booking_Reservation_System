import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function Calendar() {
    const [events, setEvents] = useState([
        { id: '1', title: 'Meeting Room A', start: new Date().toISOString().split('T')[0] + 'T10:00:00', end: new Date().toISOString().split('T')[0] + 'T12:00:00', backgroundColor: '#6366f1' },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null); // For editing/deleting

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo);
        setNewEventTitle('');
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleEventClick = (clickInfo) => {
        // Simple delete for now as per "edit" request might imply modifying title
        // But for quick MVP, let's just allow delete or re-title via same modal? 
        // For simplicity: Click opens modal to Delete or Rename.
        setSelectedEvent(clickInfo.event);
        setNewEventTitle(clickInfo.event.title);
        setShowModal(true);
    };

    const handleSaveEvent = () => {
        if (!newEventTitle) return;

        if (selectedEvent) {
            // Update existing
            selectedEvent.setProp('title', newEventTitle);
        } else {
            // Create new
            const calendarApi = selectedDate.view.calendar;
            calendarApi.unselect();
            calendarApi.addEvent({
                id: createEventId(),
                title: newEventTitle,
                start: selectedDate.startStr,
                end: selectedDate.endStr,
                allDay: selectedDate.allDay,
                backgroundColor: '#6366f1'
            });
        }
        setShowModal(false);
    };

    const handleDeleteEvent = () => {
        if (selectedEvent) {
            selectedEvent.remove();
            setShowModal(false);
        }
    };

    let eventGuid = 0;
    function createEventId() {
        return String(eventGuid++) + Date.now();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Booking Calendar</h2>
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
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events}
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
