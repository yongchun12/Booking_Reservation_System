import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Loader2, Upload, User } from 'lucide-react';
import { getProxiedImageUrl } from '../../lib/image-utils';

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [file, setFile] = useState(null);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!user) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match");
        }
        setLoading(true);
        try {
            await api.put('/auth/update-password', { currentPassword, newPassword });
            toast.success("Password updated successfully");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (file) {
                formData.append('profilePicture', file);
            }

            const res = await api.put('/auth/update-details', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Profile updated successfully!");
            // Ideally reload user context here
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="shrink-0">
                                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border relative">
                                    {(user?.profile_picture || (file && URL.createObjectURL(file))) ? (
                                        <img
                                            src={file ? URL.createObjectURL(file) : getProxiedImageUrl(user?.profile_picture)}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="picture" className="text-base font-semibold">Profile Picture</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="picture"
                                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm font-medium"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload New Picture
                                    </Label>
                                    {file && <span className="text-xs text-muted-foreground">{file.name}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue={user?.email} disabled className="bg-muted" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleUpdateProfile} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Secure your account with a new password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
                                Update Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
