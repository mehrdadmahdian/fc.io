import React from 'react';
import { useTranslation } from 'react-i18next';
import FormSelect from '../form/FormSelect';

const BoxVisibilitySettings = ({ 
    visibility = 'private', 
    tags = [], 
    language = 'en', 
    difficulty = 'beginner',
    onVisibilityChange,
    onTagsChange,
    onLanguageChange,
    onDifficultyChange,
    showAdvanced = true
}) => {
    const { t } = useTranslation();

    const handleTagsChange = (e) => {
        const tagString = e.target.value;
        const tagArray = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
        onTagsChange(tagArray);
    };

    const visibilityOptions = [
        { value: 'private', label: t('social.visibility.private') },
        { value: 'public', label: t('social.visibility.public') },
        { value: 'unlisted', label: t('social.visibility.unlisted') }
    ];

    const difficultyOptions = [
        { value: 'beginner', label: t('social.difficulty.beginner') },
        { value: 'intermediate', label: t('social.difficulty.intermediate') },
        { value: 'advanced', label: t('social.difficulty.advanced') }
    ];

    const languageOptions = [
        { value: 'en', label: t('social.languages.english') },
        { value: 'es', label: t('social.languages.spanish') },
        { value: 'fr', label: t('social.languages.french') },
        { value: 'de', label: t('social.languages.german') },
        { value: 'it', label: t('social.languages.italian') },
        { value: 'pt', label: t('social.languages.portuguese') },
        { value: 'ru', label: t('social.languages.russian') },
        { value: 'ja', label: t('social.languages.japanese') },
        { value: 'ko', label: t('social.languages.korean') },
        { value: 'zh', label: t('social.languages.chinese') }
    ];

    return (
        <div className="box-visibility-settings">
            <div className="visibility-section">
                <h3>{t('social.boxSettings.visibilityTitle')}</h3>
                <p className="section-description">
                    {t('social.boxSettings.visibilityDescription')}
                </p>
                
                <FormSelect
                    label={t('social.boxSettings.visibility')}
                    name="visibility"
                    value={visibility}
                    onChange={(e) => onVisibilityChange(e.target.value)}
                    options={visibilityOptions}
                />

                <div className="visibility-info">
                    {visibility === 'private' && (
                        <div className="info-box private">
                            <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                            <p>{t('social.visibility.privateDescription')}</p>
                        </div>
                    )}
                    {visibility === 'public' && (
                        <div className="info-box public">
                            <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <p>{t('social.visibility.publicDescription')}</p>
                        </div>
                    )}
                    {visibility === 'unlisted' && (
                        <div className="info-box unlisted">
                            <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                            </svg>
                            <p>{t('social.visibility.unlistedDescription')}</p>
                        </div>
                    )}
                </div>
            </div>

            {showAdvanced && (visibility === 'public' || visibility === 'unlisted') && (
                <div className="social-settings-section">
                    <h3>{t('social.boxSettings.socialTitle')}</h3>
                    <p className="section-description">
                        {t('social.boxSettings.socialDescription')}
                    </p>

                    <FormSelect
                        label={t('social.boxSettings.difficulty')}
                        name="difficulty"
                        value={difficulty}
                        onChange={(e) => onDifficultyChange(e.target.value)}
                        options={difficultyOptions}
                    />

                    <FormSelect
                        label={t('social.boxSettings.language')}
                        name="language"
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        options={languageOptions}
                    />

                    <div className="form-group">
                        <label htmlFor="tags-input">
                            {t('social.boxSettings.tags')}
                            <span className="optional">({t('common.optional')})</span>
                        </label>
                        <input
                            id="tags-input"
                            type="text"
                            className="form-control"
                            value={tags.join(', ')}
                            onChange={handleTagsChange}
                            placeholder={t('social.boxSettings.tagsPlaceholder')}
                            maxLength={200}
                        />
                        <small className="form-text">
                            {t('social.boxSettings.tagsHint')}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoxVisibilitySettings;
