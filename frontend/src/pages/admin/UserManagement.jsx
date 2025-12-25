import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Edit, Trash, Shield, User, Plus } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ui/confirm-modal';
import Modal from '../../components/ui/modal';
import { Label } from '../../components/ui/label';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    // Add User Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setFilteredUsers(
            users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
            setLoading(false);
        }
    };

    const toggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await api.put(`/users/${user.id}`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete(`/users/${deleteModal.id}`);
            toast.success("User deleted successfully");
            setDeleteModal({ open: false, id: null });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete user");
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            return toast.error("Please fill in all fields");
        }
        try {
            await api.post('/users', newUser);
            toast.success("User created successfully");
            setIsAddModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create user");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleRole(user)}
                                            title="Toggle Admin Role"
                                        >
                                            {user.role === 'admin' ? "Demote" : "Promote"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => setDeleteModal({ open: true, id: user.id })}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
            />

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New User"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-2 gap-2">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddUser}>Create User</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
