import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Modal from '../../components/ui/modal';
import { Plus, Search, Edit, Trash } from 'lucide-react';

export default function ResourceManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const resources = [
        { id: 1, name: 'Meeting Room A', capacity: 10, type: 'Room', status: 'Active' },
        { id: 2, name: 'Projector X1', capacity: 0, type: 'Equipment', status: 'Active' },
        { id: 3, name: 'Conference Hall', capacity: 50, type: 'Hall', status: 'Maintenance' },
    ];

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
                        {resources.map((resource) => (
                            <tr key={resource.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{resource.name}</td>
                                <td className="px-6 py-4">{resource.type}</td>
                                <td className="px-6 py-4">{resource.capacity > 0 ? resource.capacity : '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resource.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {resource.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Resource">
                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Resource Name</label>
                        <Input placeholder="e.g. Meeting Room C" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option>Room</option>
                            <option>Equipment</option>
                            <option>Hall</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Capacity</label>
                        <Input type="number" placeholder="0" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={() => setIsModalOpen(false)}>Save Resource</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
