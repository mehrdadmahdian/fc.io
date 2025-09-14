import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BoxFilters = ({ filters, onFilterChange }) => {
    const { t } = useTranslation();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFilterChange = (key, value) => {
        onFilterChange({ [key]: value });
    };

    const handleClearFilters = () => {
        onFilterChange({
            tags: '',
            language: '',
            difficulty: '',
            sort: 'created_at'
        });
    };

    const hasActiveFilters = filters.tags || filters.language || filters.difficulty || filters.sort !== 'created_at';

    return (
        <div className="box-filters">
            <div className="filters-header">
                <h3>{t('social.filters.title')}</h3>
                <button 
                    className="toggle-advanced"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? t('social.filters.hideAdvanced') : t('social.filters.showAdvanced')}
                </button>
            </div>

            <div className="filters-row">
                <div className="filter-group">
                    <label htmlFor="sort-filter">{t('social.filters.sortBy')}</label>
                    <select
                        id="sort-filter"
                        className="form-control"
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        <option value="created_at">{t('social.filters.sort.newest')}</option>
                        <option value="rating">{t('social.filters.sort.topRated')}</option>
                        <option value="forks">{t('social.filters.sort.mostForked')}</option>
                        <option value="views">{t('social.filters.sort.mostViewed')}</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="difficulty-filter">{t('social.filters.difficulty')}</label>
                    <select
                        id="difficulty-filter"
                        className="form-control"
                        value={filters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    >
                        <option value="">{t('social.filters.allDifficulties')}</option>
                        <option value="beginner">{t('social.difficulty.beginner')}</option>
                        <option value="intermediate">{t('social.difficulty.intermediate')}</option>
                        <option value="advanced">{t('social.difficulty.advanced')}</option>
                    </select>
                </div>

                {showAdvanced && (
                    <>
                        <div className="filter-group">
                            <label htmlFor="language-filter">{t('social.filters.language')}</label>
                            <select
                                id="language-filter"
                                className="form-control"
                                value={filters.language}
                                onChange={(e) => handleFilterChange('language', e.target.value)}
                            >
                                <option value="">{t('social.filters.allLanguages')}</option>
                                <option value="en">{t('social.languages.english')}</option>
                                <option value="es">{t('social.languages.spanish')}</option>
                                <option value="fr">{t('social.languages.french')}</option>
                                <option value="de">{t('social.languages.german')}</option>
                                <option value="it">{t('social.languages.italian')}</option>
                                <option value="pt">{t('social.languages.portuguese')}</option>
                                <option value="ru">{t('social.languages.russian')}</option>
                                <option value="ja">{t('social.languages.japanese')}</option>
                                <option value="ko">{t('social.languages.korean')}</option>
                                <option value="zh">{t('social.languages.chinese')}</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="tags-filter">{t('social.filters.tags')}</label>
                            <input
                                id="tags-filter"
                                type="text"
                                className="form-control"
                                value={filters.tags}
                                onChange={(e) => handleFilterChange('tags', e.target.value)}
                                placeholder={t('social.filters.tagsPlaceholder')}
                            />
                        </div>
                    </>
                )}
            </div>

            {hasActiveFilters && (
                <div className="filters-actions">
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={handleClearFilters}
                    >
                        {t('social.filters.clearAll')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BoxFilters;
