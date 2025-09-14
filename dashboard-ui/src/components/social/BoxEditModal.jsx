import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import BoxVisibilitySettings from './BoxVisibilitySettings';

const BoxEditModal = ({ box, isOpen, onClose, onBoxUpdate }) => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    
    const [visibility, setVisibility] = useState('private');
    const [tags, setTags] = useState([]);
    const [language, setLanguage] = useState('en');
    const [difficulty, setDifficulty] = useState('beginner');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (box && isOpen) {
            setFormData({
                name: box.name || '',
                description: box.description || ''
            });
            setVisibility(box.visibility || 'private');
            setTags(box.tags || []);
            setLanguage(box.language || 'en');
            setDifficulty(box.difficulty || 'beginner');
        }
    }, [box, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            error(t('boxEdit.nameRequired'));
            return;
        }

        setIsLoading(true);
        try {
            const updateData = {
                ...formData,
                visibility,
                tags,
                language,
                difficulty
            };

            // This would need to be implemented in the API
            // await api.put(`/dashboard/boxes/${box.id}`, updateData);
            
            success(t('boxEdit.updateSuccess'));
            
            if (onBoxUpdate) {
                onBoxUpdate({ ...box, ...updateData });
            }
            onClose();
        } catch (err) {
            error(t('boxEdit.updateError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen || !box) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content box-edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('boxEdit.title')}</h3>
                    <button className="modal-close" onClick={handleClose} disabled={isLoading}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="box-name">
                                {t('boxEdit.nameLabel')} <span className="required">*</span>
                            </label>
                            <input
                                id="box-name"
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('boxEdit.namePlaceholder')}
                                maxLength={100}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="box-description">
                                {t('boxEdit.descriptionLabel')}
                                <span className="optional">({t('common.optional')})</span>
                            </label>
                            <textarea
                                id="box-description"
                                name="description"
                                className="form-control"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder={t('boxEdit.descriptionPlaceholder')}
                                rows={3}
                                maxLength={500}
                                disabled={isLoading}
                            />
                            <small className="form-text">
                                {formData.description.length}/500 {t('common.characters')}
                            </small>
                        </div>

                        <BoxVisibilitySettings
                            visibility={visibility}
                            tags={tags}
                            language={language}
                            difficulty={difficulty}
                            onVisibilityChange={setVisibility}
                            onTagsChange={setTags}
                            onLanguageChange={setLanguage}
                            onDifficultyChange={setDifficulty}
                        />
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button"
                            className="btn btn-secondary" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary" 
                            disabled={isLoading || !formData.name.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner">⟳</span>
                                    {t('boxEdit.updating')}
                                </>
                            ) : (
                                t('boxEdit.updateBox')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoxEditModal;
