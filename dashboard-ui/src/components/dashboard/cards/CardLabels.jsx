import React from 'react';
import { Badge } from '../../ui/badge';

function CardLabels({ labels = [], maxDisplay = 3, showAll = false }) {
    if (!labels || labels.length === 0) {
        return null;
    }

    const displayLabels = showAll ? labels : labels.slice(0, maxDisplay);
    const remainingCount = labels.length - maxDisplay;

    return (
        <div className="flex flex-wrap gap-1">
            {displayLabels.map((label) => (
                <Badge
                    key={label.ID}
                    variant="secondary"
                    className="text-xs px-2 py-0.5"
                    style={{ 
                        backgroundColor: `${label.Color}20`, 
                        color: label.Color,
                        border: `1px solid ${label.Color}40`
                    }}
                >
                    {label.Name}
                </Badge>
            ))}
            {!showAll && remainingCount > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{remainingCount} more
                </Badge>
            )}
        </div>
    );
}

export default CardLabels;
