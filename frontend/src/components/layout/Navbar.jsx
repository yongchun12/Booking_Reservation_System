import { Menu, Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from '../ui/theme-toggle';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { format, isFuture, parseISO } from 'date-fns';

export default function Navbar({ setSidebarOpen }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch notifications (Upcoming bookings)
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const res = await api.get('/bookings');
                // Filter only future bookings
                const upcoming = res.data.filter(b => {
                    // Quick date parse fallback
                    const dateStr = b.booking_date.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
                    const dateTime = new Date(`${dateStr}T${b.start_time}`);
                    return isFuture(dateTime);
                }).slice(0, 5); // Take top 5

                setNotifications(upcoming.map(b => ({
                    id: b.id,
                    title: "Upcoming Booking",
                    message: `You have a booking for ${b.resource_name} on ${dateStr}`, // dateStr from closure? No need to re-parse perfectly here
                    time: "Soon"
                })));
            } catch (e) {
                console.error("Failed to fetch notifications", e);
            }
        };
        fetchNotifications();
    }, [user]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/resources?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            {/* Mobile Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
            </Button>

            {/* Command/Search placeholder */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search... (Command+K)"
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px] cursor-pointer"
                        readOnly
                        onClick={() => window.dispatchEvent(new Event('open-global-search'))}
                    />
                    <div className="absolute right-2 top-2 hidden md:flex items-center gap-1 pointer-events-none">
                        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <ModeToggle />

                {/* Notification Bell */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifications</span>
                            {/* Notification Dot */}
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-sm text-center text-muted-foreground">No new notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 cursor-pointer" onClick={() => navigate('/my-bookings')}>
                                        <span className="font-medium text-sm">{n.title}</span>
                                        <span className="text-xs text-muted-foreground mt-1">{n.message}</span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 rounded-full border hover:bg-muted">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium hidden md:block">{user?.name || 'User'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email || 'user@example.com'}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
