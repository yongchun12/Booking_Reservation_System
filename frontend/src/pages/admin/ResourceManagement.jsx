import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/ui/modal';
import ConfirmModal from '../../components/ui/confirm-modal';
import { Plus, Search, Edit, Trash, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function ResourceManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'Room',
        capacity: 0
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchResources = async () => {
        try {
            const res = await api.get('/resources');
            setResources(res.data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
            toast.error("Failed to load resources");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleAddResource = async () => {
        if (!formData.name) {
            toast.error("Resource name is required");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/resources', formData);
            toast.success("Resource added successfully");
            setIsModalOpen(false);
            setFormData({ name: '', type: 'Room', capacity: 0 }); // Reset form
            fetchResources(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to add resource");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteResource = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            await api.delete(`/resources/${deleteModal.id}`);
            toast.success("Resource deleted");
            fetchResources();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete resource");
        } finally {
            setDeleting(false);
            setDeleteModal({ open: false, id: null });
        }
    };

    // Filter logic
    const filteredResources = resources.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Resource Management</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
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
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Capacity</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></td>
                            </tr>
                        ) : filteredResources.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-muted-foreground">No resources found.</td>
                            </tr>
                        ) : (
                            filteredResources.map((resource) => (
                                <tr key={resource.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{resource.name}</td>
                                    <td className="px-6 py-4">{resource.type}</td>
                                    <td className="px-6 py-4">{resource.capacity > 0 ? resource.capacity : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${resource.is_active || resource.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {resource.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteResource(resource.id)}
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Resource">
                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Resource Name</label>
                        <Input
                            placeholder="e.g. Meeting Room C"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option>Room</option>
                            <option>Equipment</option>
                            <option>Hall</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Capacity</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAddResource} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Resource
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
