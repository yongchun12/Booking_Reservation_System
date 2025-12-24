import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Calendar() {
    const [events, setEvents] = useState([
        { title: 'Meeting Room A', start: new Date().toISOString().split('T')[0] + 'T10:00:00', end: new Date().toISOString().split('T')[0] + 'T12:00:00', backgroundColor: '#6366f1' },
        { title: 'Projector', start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00', backgroundColor: '#8b5cf6' }
    ]);

    const handleDateSelect = (selectInfo) => {
        let title = prompt('Please enter a new title for your event');
        let calendarApi = selectInfo.view.calendar;

        calendarApi.unselect(); // clear date selection

        if (title) {
            calendarApi.addEvent({
                id: createEventId(),
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: selectInfo.allDay
            })
        }
    }

    const handleEventClick = (clickInfo) => {
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
            clickInfo.event.remove()
        }
    }

    let eventGuid = 0;
    function createEventId() {
        return String(eventGuid++)
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

                        // Tailwind Customization Hooks could go here or via CSS
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
