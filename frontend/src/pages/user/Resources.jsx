import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Wifi, Monitor } from 'lucide-react';

const resources = [
    { id: 1, name: 'Meeting Room A', capacity: 10, type: 'Room', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', features: ['Wifi', 'Projector', 'Whiteboard'] },
    { id: 2, name: 'Meeting Room B', capacity: 6, type: 'Room', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', features: ['Wifi', 'TV'] },
    { id: 3, name: 'Conference Hall', capacity: 50, type: 'Hall', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80', features: ['Stage', 'Sound System', 'Wifi'] },
    { id: 4, name: 'Projector X1', capacity: 0, type: 'Equipment', image: 'https://images.unsplash.com/photo-1517604931442-71053e3e2c3c?auto=format&fit=crop&w=800&q=80', features: ['4K Resolution', 'HDMI'] },
];

export default function Resources() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
                <Button>Add Resource (Admin)</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden flex flex-col">
                        <div className="aspect-video w-full overflow-hidden">
                            <img
                                src={resource.image}
                                alt={resource.name}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {resource.type}
                                </span>
                                {resource.capacity > 0 && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Users className="mr-1 h-3 w-3" />
                                        {resource.capacity}
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-xl">{resource.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2">
                                {resource.features.map((feature) => (
                                    <span key={feature} className="text-xs border px-2 py-1 rounded-md text-muted-foreground">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Book Now</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
