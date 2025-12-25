import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input'; // Keeping Input for search
import { Label } from '../../components/ui/label';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DatePicker } from '../../components/ui/date-picker';
import { TimeSelect } from '../../components/ui/time-select';
import { format } from 'date-fns';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const steps = [
    { id: 1, title: 'Select Date & Time' },
    { id: 2, title: 'Select Resource' },
    { id: 3, title: 'Add People' },
    { id: 4, title: 'Confirm Details' },
];

export default function NewBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        resource: null,
        resourceName: '',
        capacity: 0,
        attendees: [], // Array of user IDs
        attendeeNames: [] // Array of names for display
    });

    const [resources, setResources] = useState([]);
    const [fetchingResources, setFetchingResources] = useState(false);

    // User Search State
    const [users, setUsers] = useState([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Handle "Book Again" or redirected state
    useEffect(() => {
        if (location.state) {
            if (location.state.bookingId) {
                setEditingId(location.state.bookingId);
            }
            setFormData(prev => ({
                ...prev,
                resource: location.state.resourceId || prev.resource,
                resourceName: location.state.resourceName || prev.resourceName || 'Selected Resource',
                date: location.state.date || prev.date,
                startTime: location.state.startTime || prev.startTime,
                endTime: location.state.endTime || prev.endTime
            }));
        }
    }, [location.state]);


    // Fetch resources when entering step 2
    useEffect(() => {
        if (currentStep === 2) {
            const fetchResources = async () => {
                setFetchingResources(true);
                try {
                    const res = await api.get('/resources');
                    setResources(res.data);
                } catch (error) {
                    console.error("Failed to fetch resources", error);
                    toast.error("Failed to load resources");
                } finally {
                    setFetchingResources(false);
                }
            };
            fetchResources();
        }

        // Fetch users when entering step 3
        if (currentStep === 3) {
            const fetchUsers = async () => {
                setFetchingUsers(true);
                try {
                    const res = await api.get('/users');
                    setUsers(res.data);
                } catch (error) {
                    console.error("Failed to fetch users", error);
                    // Silent fail or toast? Toast is better
                    // toast.error("Failed to load users"); 
                } finally {
                    setFetchingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [currentStep]);

    const nextStep = () => {
        // Validation
        if (currentStep === 1) {
            if (!formData.date || !formData.startTime || !formData.endTime) {
                toast.error("Please select date and time range");
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.resource) {
                toast.error("Please select a resource");
                return;
            }
        }
        // Step 3 (Attendees) is optional
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const toggleAttendee = (user) => {
        const isSelected = formData.attendees.includes(user.id);
        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                attendees: prev.attendees.filter(id => id !== user.id),
                attendeeNames: prev.attendeeNames.filter(name => name !== user.name)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                attendees: [...prev.attendees, user.id],
                attendeeNames: [...prev.attendeeNames, user.name]
            }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                resource_id: formData.resource,
                booking_date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                notes: `Booking for ${formData.resourceName}`,
                attendee_ids: formData.attendees
            };

            if (editingId) {
                await api.put(`/bookings/${editingId}`, payload);
                toast.success("Booking updated successfully!");
            } else {
                await api.post('/bookings', payload);
                toast.success("Booking confirmed successfully!");
            }
            navigate('/my-bookings');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8">
            {/* Steps Indicator */}
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center w-full justify-between">
                    {steps.map((step, stepIdx) => (
                        <li key={step.title} className={cn("relative flex flex-col items-center flex-1", stepIdx !== steps.length - 1 ? 'border-t-2 border-transparent' : '')}>
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 mb-2 z-10 bg-background",
                                step.id < currentStep ? "border-primary bg-primary text-primary-foreground" :
                                    step.id === currentStep ? "border-primary text-primary" : "border-border text-muted-foreground"
                            )}>
                                {step.id < currentStep ? <CheckCircle className="h-5 w-5" /> : <span>{step.id}</span>}
                            </div>
                            <span className={cn(
                                "text-sm font-medium text-center",
                                step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                            )}>{step.title}</span>

                            {/* Connector Line (simplified css for now) */}
                            {stepIdx !== steps.length - 1 && (
                                <div className={cn(
                                    "absolute top-4 left-1/2 w-full h-[2px] -z-0",
                                    step.id < currentStep ? "bg-primary" : "bg-border"
                                )} />
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Select Date</Label>
                                <DatePicker
                                    date={formData.date ? new Date(formData.date) : undefined}
                                    setDate={(d) => setFormData({ ...formData, date: d ? format(d, 'yyyy-MM-dd') : '' })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Time Range</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <TimeSelect
                                            value={formData.startTime}
                                            onChange={(v) => setFormData({ ...formData, startTime: v })}
                                        />
                                    </div>
                                    <span>-</span>
                                    <div className="flex-1">
                                        <TimeSelect
                                            value={formData.endTime}
                                            onChange={(v) => setFormData({ ...formData, endTime: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <Label>Available Resources</Label>
                            {fetchingResources ? (
                                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {resources.map((res) => (
                                        <div
                                            key={res.id}
                                            className={cn(
                                                "border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors",
                                                formData.resource === res.id ? "border-primary bg-primary/5" : ""
                                            )}
                                            onClick={() => setFormData({ ...formData, resource: res.id, resourceName: res.name, capacity: res.capacity })}
                                        >
                                            <h4 className="font-semibold">{res.name}</h4>
                                            <p className="text-sm text-muted-foreground">Type: {res.type} • Capacity: {res.capacity || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <Label>Invited Attendees (Optional)</Label>

                            {/* Search Input */}
                            <Input
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2"
                            />

                            {fetchingUsers ? (
                                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <div className="grid gap-2 sm:grid-cols-3 max-h-60 overflow-y-auto">
                                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                                        <div
                                            key={u.id}
                                            className={cn(
                                                "flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-muted",
                                                formData.attendees.includes(u.id) ? "border-primary bg-primary/5" : ""
                                            )}
                                            onClick={() => toggleAttendee(u)}
                                        >
                                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span className="text-sm truncate">{u.name}</span>
                                            {formData.attendees.includes(u.id) && <CheckCircle className="h-4 w-4 text-primary ml-auto" />}
                                        </div>
                                    ))}
                                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                        <p className="text-sm text-muted-foreground col-span-3">No users found matching "{searchTerm}".</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <dt className="text-muted-foreground">Date:</dt>
                                    <dd>{formData.date}</dd>
                                    <dt className="text-muted-foreground">Time:</dt>
                                    <dd>{formData.startTime} - {formData.endTime}</dd>
                                    <dt className="text-muted-foreground">Resource:</dt>
                                    <dd>{formData.resourceName || 'Selected Resource'}</dd>
                                    <dt className="text-muted-foreground">Attendees:</dt>
                                    <dd>
                                        {formData.attendeeNames.length > 0
                                            ? formData.attendeeNames.join(', ')
                                            : 'None'}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    {currentStep < steps.length ? (
                        <Button onClick={nextStep}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? 'Update Booking' : 'Confirm Booking'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
