import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const statusOptions = [
    { value: 'all', label: 'all', icon: 'fa-layer-group' },
    { value: 'new', label: 'new', icon: 'fa-star' },
    { value: 'learning', label: 'learning', icon: 'fa-graduation-cap' },
    { value: 'review', label: 'review', icon: 'fa-redo' },
    { value: 'archived', label: 'archived', icon: 'fa-archive' }
];

function StatusFilter({ value, onChange, className = '' }) {
    const { t } = useTranslation();
    
    const selectedOption = statusOptions.find(opt => opt.value === value) || statusOptions[0];

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`w-[180px] ${className}`}>
                <div className="flex items-center gap-2">
                    <i className={`fas ${selectedOption.icon}`}></i>
                    <SelectValue>
                        {t(`cards.${selectedOption.label}`)}
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent>
                {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                            <i className={`fas ${option.icon}`}></i>
                            <span>{t(`cards.${option.label}`)}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default StatusFilter;
