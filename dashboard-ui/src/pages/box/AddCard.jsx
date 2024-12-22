import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../components/layout/Navigation';
import LabelSelect from '../../components/dashboard/cards/LabelSelect';
import '../../assets/styles/AddCard.css';

function AddCard() {
    const { t } = useTranslation();
    // const { boxId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        additionalInfo: '',
        labels: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate(`/dashboard`);
        } catch (error) {
            console.error('Failed to create card:', error);
        }
    };

    const handleCancel = () => {
        navigate(`/dashboard`);
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleLabelsChange = (newLabels) => {
        setFormData(prev => ({
            ...prev,
            labels: newLabels
        }));
    };

    return (
        <div className="dashboard-layout">
            <Navigation />
            <div className="content-container">
                <div className="add-card-wrapper">
                    <div className="add-card-panel">
                        <div className="panel-header">
                            <h2>{t('addCard.title')}</h2>
                            <div className="current-labels">
                                {formData.labels.map(label => (
                                    <span 
                                        key={label.id} 
                                        className="label-badge"
                                        style={{ backgroundColor: label.color }}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="panel-content">
                            <form onSubmit={handleSubmit} className="card-form">
                                <div className="form-section">
                                    <div className="form-group">
                                        <label htmlFor="question">
                                            <i className="fas fa-question-circle"></i>
                                            {t('addCard.question')}
                                        </label>
                                        <textarea
                                            id="question"
                                            value={formData.question}
                                            onChange={handleChange('question')}
                                            required
                                            rows={4}
                                            placeholder={t('addCard.questionPlaceholder')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="answer">
                                            <i className="fas fa-lightbulb"></i>
                                            {t('addCard.answer')}
                                        </label>
                                        <textarea
                                            id="answer"
                                            value={formData.answer}
                                            onChange={handleChange('answer')}
                                            required
                                            rows={4}
                                            placeholder={t('addCard.answerPlaceholder')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="additionalInfo">
                                            <i className="fas fa-info-circle"></i>
                                            {t('addCard.additionalInfo')}
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            value={formData.additionalInfo}
                                            onChange={handleChange('additionalInfo')}
                                            rows={3}
                                            placeholder={t('addCard.additionalInfoPlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div className="labels-section">
                                    <label className="label-header">
                                        <i className="fas fa-tags"></i>
                                        {t('addCard.labels')}
                                    </label>
                                    <LabelSelect
                                        selectedLabels={formData.labels}
                                        onChange={handleLabelsChange}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                                        <i className="fas fa-times"></i>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        <i className="fas fa-save"></i>
                                        {t('addCard.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddCard; 