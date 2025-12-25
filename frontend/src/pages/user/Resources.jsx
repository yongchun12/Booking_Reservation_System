import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize search from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search');
        if (q) setSearchTerm(q);
    }, [location.search]);

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

    // Filter resources based on search
    const filteredResources = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Resources</h2>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredResources.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {searchTerm ? "No resources match your search." : "No resources found. Ask an admin to add some!"}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResources.map((resource) => (
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
                                <Button
                                    className="w-full"
                                    onClick={() => navigate('/new-booking', { state: { resourceId: resource.id, resourceName: resource.name } })}
                                >
                                    Book Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
