import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils'; // Keep forgetting to ensure imports work, assuming relative path is correct

const steps = [
    { id: 1, title: 'Select Date & Time' },
    { id: 2, title: 'Select Resource' },
    { id: 3, title: 'Confirm Details' },
];

export default function NewBooking() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        resource: null,
    });

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8">
            {/* Steps Indicator */}
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
                            <div className="items-center flex">
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                                    step.id < currentStep ? "border-primary bg-primary text-primary-foreground" :
                                        step.id === currentStep ? "border-primary text-primary" : "border-border text-muted-foreground"
                                )}>
                                    {step.id < currentStep ? <CheckCircle className="h-5 w-5" /> : <span>{step.id}</span>}
                                </div>
                                <span className={cn(
                                    "ml-4 text-sm font-medium",
                                    step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                                )}>{step.title}</span>
                                {stepIdx !== steps.length - 1 && (
                                    <div className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full bg-border sm:w-full ml-10 translate-x-12" aria-hidden="true" />
                                )}
                            </div>
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
                                <Label>Date</Label>
                                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time Range</Label>
                                <div className="flex gap-2 items-center">
                                    <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                                    <span>-</span>
                                    <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <Label>Available Resources</Label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors",
                                            formData.resource === i ? "border-primary bg-primary/5" : ""
                                        )}
                                        onClick={() => setFormData({ ...formData, resource: i })}
                                    >
                                        <h4 className="font-semibold">Meeting Room {String.fromCharCode(64 + i)}</h4>
                                        <p className="text-sm text-muted-foreground">Capacity: {10 * i}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <dt className="text-muted-foreground">Date:</dt>
                                    <dd>{formData.date}</dd>
                                    <dt className="text-muted-foreground">Time:</dt>
                                    <dd>{formData.startTime} - {formData.endTime}</dd>
                                    <dt className="text-muted-foreground">Resource:</dt>
                                    <dd>Meeting Room {formData.resource ? String.fromCharCode(64 + formData.resource) : 'None'}</dd>
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
                        <Button>Confirm Booking</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
