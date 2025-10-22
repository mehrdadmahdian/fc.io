import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function CustomReviewFilters({ 
    filters, 
    onFiltersChange, 
    onBoxChange, 
    availableBoxes, 
    availableLabels, 
    onStartReview, 
    loading,
    isBoxSpecific = false
}) {
    const { t } = useTranslation();
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleBoxSelect = (boxId) => {
        handleFilterChange('boxId', boxId);
        onBoxChange(boxId);
    };

    const handleLabelToggle = (labelId) => {
        const currentLabels = localFilters.labelIds || [];
        const newLabels = currentLabels.includes(labelId)
            ? currentLabels.filter(id => id !== labelId)
            : [...currentLabels, labelId];
        handleFilterChange('labelIds', newLabels);
    };

    const handleDifficultyToggle = (difficulty) => {
        const currentDifficulties = localFilters.difficulty || [];
        const newDifficulties = currentDifficulties.includes(difficulty)
            ? currentDifficulties.filter(d => d !== difficulty)
            : [...currentDifficulties, difficulty];
        handleFilterChange('difficulty', newDifficulties);
    };

    const handleStartReview = () => {
        onFiltersChange(localFilters);
        onStartReview();
    };

    return (
        <div className="custom-review-filters">
            <div className="filters-header">
                <h3>{t('customReview.filters.title')}</h3>
                <p>{t('customReview.filters.description')}</p>
            </div>

            <div className="filters-content">
                {/* Box Selection - Only show for global custom review */}
                {!isBoxSpecific && (
                    <div className="filter-group">
                        <label className="filter-label">
                            {t('customReview.filters.box')}
                        </label>
                        <select 
                            className="form-control"
                            value={localFilters.boxId}
                            onChange={(e) => handleBoxSelect(e.target.value)}
                        >
                            <option value="">{t('customReview.filters.allBoxes')}</option>
                            {availableBoxes.map(box => (
                                <option key={box.ID} value={box.ID}>
                                    {box.Name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Label Selection */}
                {availableLabels.length > 0 && (
                    <div className="filter-group">
                        <label className="filter-label">
                            {t('customReview.filters.labels')}
                        </label>
                        <div className="label-filters">
                            {availableLabels.map(label => (
                                <label key={label.ID} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.labelIds?.includes(label.ID) || false}
                                        onChange={() => handleLabelToggle(label.ID)}
                                    />
                                    <span 
                                        className="label-color" 
                                        style={{ backgroundColor: label.Color }}
                                    ></span>
                                    <span className="label-name">{label.Name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookmark Filter */}
                <div className="filter-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={localFilters.bookmarked}
                            onChange={(e) => handleFilterChange('bookmarked', e.target.checked)}
                        />
                        <span className="checkbox-text">
                            {t('customReview.filters.bookmarkedOnly')}
                        </span>
                    </label>
                </div>

                {/* Difficulty Filter */}
                <div className="filter-group">
                    <label className="filter-label">
                        {t('customReview.filters.difficulty')}
                    </label>
                    <div className="difficulty-filters">
                        {['easy', 'medium', 'hard'].map(difficulty => (
                            <label key={difficulty} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={localFilters.difficulty?.includes(difficulty) || false}
                                    onChange={() => handleDifficultyToggle(difficulty)}
                                />
                                <span className="checkbox-text">
                                    {t(`customReview.difficulty.${difficulty}`)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Shuffle Option */}
                <div className="filter-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={localFilters.shuffle}
                            onChange={(e) => handleFilterChange('shuffle', e.target.checked)}
                        />
                        <span className="checkbox-text">
                            {t('customReview.filters.shuffle')}
                        </span>
                    </label>
                </div>

                {/* Limit */}
                <div className="filter-group">
                    <label className="filter-label">
                        {t('customReview.filters.limit')}
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="200"
                        value={localFilters.limit}
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value) || 50)}
                    />
                </div>
            </div>

            <div className="filters-actions">
                <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleStartReview}
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('customReview.startReview')}
                </button>
            </div>
        </div>
    );
}

export default CustomReviewFilters;
