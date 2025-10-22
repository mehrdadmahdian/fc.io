import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../services/api';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useToast } from '../../../contexts/ToastContext';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';
import '../../../assets/styles/LabelManager.css';

function LabelManager({ boxId, onLabelsChange }) {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingLabel, setEditingLabel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#3B82F6'
    });

    const predefinedColors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    useEffect(() => {
        fetchLabels();
    }, [boxId]);

    const fetchLabels = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/dashboard/boxes/${boxId}/labels`);
            if (response.data.status === 'success') {
                setLabels(response.data.data.labels || []);
            }
        } catch (err) {
            showError('Failed to fetch labels');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLabel = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/dashboard/boxes/${boxId}/labels`, {
                name: formData.name,
                color: formData.color
            });

            if (response.data.status === 'success') {
                success('Label created successfully');
                setFormData({ name: '', color: '#3B82F6' });
                setShowCreateForm(false);
                fetchLabels();
                onLabelsChange && onLabelsChange();
            }
        } catch (err) {
            showError('Failed to create label');
        }
    };

    const handleUpdateLabel = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/dashboard/labels/${editingLabel.ID}`, {
                name: formData.name,
                color: formData.color
            });

            if (response.data.status === 'success') {
                success('Label updated successfully');
                setEditingLabel(null);
                setFormData({ name: '', color: '#3B82F6' });
                fetchLabels();
                onLabelsChange && onLabelsChange();
            }
        } catch (err) {
            showError('Failed to update label');
        }
    };

    const handleDeleteLabel = async (labelId) => {
        if (!window.confirm('Are you sure you want to delete this label?')) {
            return;
        }

        try {
            const response = await api.delete(`/dashboard/labels/${labelId}`);
            if (response.data.status === 'success') {
                success('Label deleted successfully');
                fetchLabels();
                onLabelsChange && onLabelsChange();
            }
        } catch (err) {
            showError('Failed to delete label');
        }
    };

    const startEdit = (label) => {
        setEditingLabel(label);
        setFormData({
            name: label.Name,
            color: label.Color
        });
    };

    const cancelEdit = () => {
        setEditingLabel(null);
        setFormData({ name: '', color: '#3B82F6' });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Labels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Labels</CardTitle>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Label
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Create/Edit Form */}
                {(showCreateForm || editingLabel) && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-3">
                            {editingLabel ? 'Edit Label' : 'Create New Label'}
                        </h4>
                        <form onSubmit={editingLabel ? handleUpdateLabel : handleCreateLabel}>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Label name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {predefinedColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-8 h-8 rounded-full border-2 ${
                                                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setFormData({ ...formData, color })}
                                            />
                                        ))}
                                    </div>
                                    <Input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="mt-2 w-20 h-8"
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm">
                                        {editingLabel ? 'Update' : 'Create'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={editingLabel ? cancelEdit : () => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Labels List */}
                <div className="space-y-2">
                    {labels.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            No labels yet. Create your first label to organize your cards.
                        </div>
                    ) : (
                        labels.map((label) => (
                            <div
                                key={label.ID}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: label.Color }}
                                    />
                                    <span className="font-medium">{label.Name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEdit(label)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteLabel(label.ID)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default LabelManager;
