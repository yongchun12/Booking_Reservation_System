import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import Modal from '../../components/ui/modal';
import ConfirmModal from '../../components/ui/confirm-modal';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Name is required");
        setSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
                toast.success("Category updated");
            } else {
                await api.post('/categories', formData);
                toast.success("Category created");
            }
            setModalOpen(false);
            fetchCategories();
            setFormData({ name: '', description: '' });
            setEditingCategory(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/categories/${categoryToDelete.id}`);
            toast.success("Category deleted");
            fetchCategories();
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error("Failed to delete category");
        } finally {
            setDeleting(false);
            setCategoryToDelete(null);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{cat.name}</td>
                                            <td className="px-6 py-4">{cat.description}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => openModal(cat)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setCategoryToDelete(cat); setDeleteModalOpen(true); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No categories found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCategory ? "Edit Category" : "Add Category"}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
                confirmText="Delete"
                isLoading={deleting}
            />
        </div>
    );
}
