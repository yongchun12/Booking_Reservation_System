import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await api.get('/resources');
                setResources(res.data);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
            </div>
            {resources.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No resources found. Ask an admin to add some!
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {resources.map((resource) => (
                        <Card key={resource.id} className="overflow-hidden flex flex-col">
                            <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
                                {/* Placeholder since DB might just have image URL string. Adjust if you really have image upload */}
                                <span className="text-4xl">🏢</span>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
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
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {resource.description || "No description available."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">Book Now</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
