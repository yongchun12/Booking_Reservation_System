import { NavLink } from 'react-router-dom';
import { Home, Calendar, Package, Users, Settings, LogOut, X, LayoutDashboard, Box } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

import { getProxiedImageUrl } from '../../lib/image-utils';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { logout, user } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Resources', href: '/resources', icon: Package },
        { name: 'My Bookings', href: '/my-bookings', icon: Calendar },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    if (user?.role === 'admin') {
        navigation.push(
            { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
            { name: 'Manage Resources', href: '/admin/resources', icon: Box },
            { name: 'Manage Categories', href: '/admin/categories', icon: Package }, // Re-using Package icon or similar
            { name: 'Manage Users', href: '/admin/users', icon: Users }
        );
    }

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden",
                    sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r bg-card transition-transform duration-300 md:static md:flex md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-6 border-b">
                    <span className="text-xl font-bold tracking-tight text-primary">CSC3074 Booking Sys</span>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === '/admin'}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* User Info */}
                <div className="mt-auto px-4 pb-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-background border flex items-center justify-center">
                            {user?.profile_picture ? (
                                <img src={getProxiedImageUrl(user.profile_picture)} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="font-semibold text-muted-foreground">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
                            <p className="truncate text-xs text-muted-foreground">{user?.email || 'email'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4">
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-5 w-5" />
                        Log Out
                    </Button>
                </div>
            </div>
        </>
    );
}
