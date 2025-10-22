import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Check, X } from 'lucide-react';

function LabelSelector({ boxId, selectedLabels = [], onLabelsChange, disabled = false }) {
    const { t } = useTranslation();
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Failed to fetch labels:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLabelToggle = (labelId) => {
        if (disabled) return;
        
        const isSelected = selectedLabels.includes(labelId);
        const newSelection = isSelected
            ? selectedLabels.filter(id => id !== labelId)
            : [...selectedLabels, labelId];
        
        onLabelsChange(newSelection);
    };

    const handleClearAll = () => {
        if (disabled) return;
        onLabelsChange([]);
    };

    if (loading) {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium">Labels</label>
                <div className="text-sm text-gray-500">Loading labels...</div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Labels</label>
                {selectedLabels.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        disabled={disabled}
                        className="text-xs"
                    >
                        Clear All
                    </Button>
                )}
            </div>
            
            {labels.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">
                    No labels available. Create labels in the box settings to organize your cards.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {labels.map((label) => {
                        const isSelected = selectedLabels.includes(label.ID);
                        return (
                            <button
                                key={label.ID}
                                type="button"
                                onClick={() => handleLabelToggle(label.ID)}
                                disabled={disabled}
                                className={`
                                    inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                                    border transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                style={{
                                    borderColor: isSelected ? label.Color : undefined,
                                    backgroundColor: isSelected ? `${label.Color}20` : undefined
                                }}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: label.Color }}
                                />
                                <span>{label.Name}</span>
                                {isSelected && <Check className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>
            )}
            
            {selectedLabels.length > 0 && (
                <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Selected labels:</div>
                    <div className="flex flex-wrap gap-1">
                        {selectedLabels.map((labelId) => {
                            const label = labels.find(l => l.ID === labelId);
                            if (!label) return null;
                            
                            return (
                                <Badge
                                    key={labelId}
                                    variant="secondary"
                                    className="text-xs"
                                    style={{ backgroundColor: `${label.Color}20`, color: label.Color }}
                                >
                                    {label.Name}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabelSelector;
