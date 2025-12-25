import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Modal from '../../components/ui/modal';
import ConfirmModal from '../../components/ui/confirm-modal';
import { Plus, Edit, Trash, Loader2, Upload, AlertTriangle, Search } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { getProxiedImageUrl } from '../../lib/image-utils';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ResourceManagement Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 border-2 border-red-500 rounded-lg bg-red-50 text-red-900">
                    <div className="flex items-center gap-2 text-xl font-bold mb-4">
                        <AlertTriangle className="h-6 w-6" />
                        Something went wrong!
                    </div>
                    <pre className="p-4 bg-white rounded border overflow-auto text-sm font-mono">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <Button onClick={() => window.location.reload()} className="mt-4" variant="destructive">
                        Reload Page
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

function ResourceManagementContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Room',
        capacity: 0,
        location: '',
        image: null
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await api.get('/resources');
            // Ensure data is array
            setResources(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch resources");
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async (id) => {
        setDeleteModal({ open: true, id });
    };

    const handleEditClick = (resource) => {
        setEditingId(resource.id);
        setFormData({
            name: resource.name,
            type: resource.type,
            capacity: resource.capacity || 0,
            location: resource.location || '',
            image: null // Reset image on edit start
        });
        setIsModalOpen(true);
    };

    const handleSaveResource = async () => {
        if (!formData.name) {
            toast.error("Resource name is required");
            return;
        }
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('capacity', formData.capacity);
            data.append('location', formData.location);
            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            if (editingId) {
                await api.put(`/resources/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Resource updated");
            } else {
                await api.post('/resources', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Resource added");
            }

            setIsModalOpen(false);
            setFormData({ name: '', type: 'Room', capacity: 0, image: null, location: '' });
            setEditingId(null);
            fetchResources();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save resource");
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
    const filteredResources = (resources || []).filter(r =>
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.type || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Capacity</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></td>
                            </tr>
                        ) : filteredResources.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-muted-foreground">No resources found.</td>
                            </tr>
                        ) : (
                            filteredResources.map((resource) => (
                                <tr key={resource.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{resource.name}</td>
                                    <td className="px-6 py-4">{resource.type}</td>
                                    <td className="px-6 py-4">{resource.location || '-'}</td>
                                    <td className="px-6 py-4">{resource.capacity > 0 ? resource.capacity : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${resource.is_active || resource.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {resource.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(resource)}>
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

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={confirmDeleteResource}
                title="Delete Resource"
                description="Are you sure you want to delete this resource?"
            />

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
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            placeholder="e.g. Level 1"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
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
                    <div className="space-y-2">
                        <Label>Resource Image</Label>
                        <div className="flex items-center gap-3 border rounded-md p-3 bg-muted/20 border-dashed">
                            <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden border shrink-0">
                                {formData.image && (formData.image instanceof File || formData.image instanceof Blob) ? (
                                    <img src={URL.createObjectURL(formData.image)} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-xs text-muted-foreground text-center px-1">No Image</div>
                                )}
                            </div>
                            <div className="space-y-1 flex-1">
                                <Input
                                    id="resource-image"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                />
                                <Label
                                    htmlFor="resource-image"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium cursor-pointer hover:bg-muted bg-background transition-colors"
                                >
                                    <Upload className="h-3 w-3" />
                                    Choose File
                                </Label>
                                <p className="text-[10px] text-muted-foreground">Max 5MB. JPG/PNG supported.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleSaveResource} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Resource
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function ResourceManagement() {
    return (
        <ErrorBoundary>
            <ResourceManagementContent />
        </ErrorBoundary>
    );
}
