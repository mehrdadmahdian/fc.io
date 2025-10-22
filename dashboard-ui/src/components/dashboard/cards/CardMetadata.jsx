import React from 'react';
import { Bookmark, Star, StarHalf, Zap } from 'lucide-react';
import { Badge } from '../../ui/badge';

function CardMetadata({ card, showBookmark = true, showDifficulty = true, showLabels = true }) {
    const getDifficultyIcon = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return <Star className="w-3 h-3" />;
            case 'medium':
                return <StarHalf className="w-3 h-3" />;
            case 'hard':
                return <Zap className="w-3 h-3" />;
            default:
                return null;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'hard':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bookmark */}
            {showBookmark && card.IsBookmarked && (
                <Badge variant="outline" className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    Bookmarked
                </Badge>
            )}

            {/* Difficulty */}
            {showDifficulty && card.Difficulty && (
                <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getDifficultyColor(card.Difficulty)}`}
                >
                    {getDifficultyIcon(card.Difficulty)}
                    {card.Difficulty.charAt(0).toUpperCase() + card.Difficulty.slice(1)}
                </Badge>
            )}

            {/* Labels */}
            {showLabels && card.Labels && card.Labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {card.Labels.slice(0, 2).map((label) => (
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
                    {card.Labels.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{card.Labels.length - 2}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

export default CardMetadata;
