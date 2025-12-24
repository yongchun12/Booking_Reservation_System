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

export default function Navbar({ setSidebarOpen }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

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
                        placeholder="Search resources..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <ModeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
