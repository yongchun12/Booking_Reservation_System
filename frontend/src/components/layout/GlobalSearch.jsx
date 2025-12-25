import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, LayoutDashboard, Settings, BookOpen, Plus, Users, Box, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Define all available navigation items
    const allItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'Pages' },
        { name: 'My Bookings', icon: BookOpen, path: '/my-bookings', section: 'Pages' },
        { name: 'Calendar', icon: Calendar, path: '/calendar', section: 'Pages' },
        { name: 'New Booking', icon: Plus, path: '/new-booking', section: 'Actions' },
        { name: 'Settings', icon: Settings, path: '/settings', section: 'Account' },
    ];

    if (user?.role === 'admin') {
        allItems.push(
            { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin', section: 'Admin' },
            { name: 'Manage Resources', icon: Box, path: '/admin/resources', section: 'Admin' },
            { name: 'Manage Users', icon: Users, path: '/admin/users', section: 'Admin' }
        );
    }

    const filteredItems = query
        ? allItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
        : allItems;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleOpenSearch = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-global-search', handleOpenSearch);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-global-search', handleOpenSearch);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[activeIndex]) {
                    handleSelect(filteredItems[activeIndex].path);
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, activeIndex, filteredItems]);

    const handleSelect = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            <div className="w-full max-w-lg bg-background rounded-xl shadow-2xl border overflow-hidden relative z-[101] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 py-3 border-b">
                    <Search className="h-5 w-5 text-muted-foreground mr-3" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                    />
                    <div className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">ESC</div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-2">
                    {filteredItems.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    ) : (
                        <div className="px-2 space-y-1">
                            {filteredItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => handleSelect(item.path)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors text-left ${index === activeIndex
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-foreground hover:bg-muted'
                                            }`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <Icon className={`h-4 w-4 ${index === activeIndex ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div className="flex-1">
                                            {item.name}
                                            {item.section === 'Admin' && (
                                                <span className="ml-2 text-[10px] uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>
                                            )}
                                        </div>
                                        {index === activeIndex && <span className="text-xs text-muted-foreground">↵</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground flex justify-between">
                    <div>
                        <span className="font-medium">↑↓</span> to navigate
                    </div>
                    <div>
                        <span className="font-medium">↵</span> to select
                    </div>
                </div>
            </div>
        </div>
    );
}
