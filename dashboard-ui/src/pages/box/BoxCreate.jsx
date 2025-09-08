import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModernContainer from '../../components/layout/ModernContainer';
import Form from '../../components/form/Form';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';
import '../../assets/styles/ModernPage.css';

function BoxCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { success, error } = useToast();

    const handleSubmit = async (formData) => {
        try {
            await api.post('/dashboard/boxes', formData);
            success(t('boxCreate.createSuccess'));
            
            // Navigate to dashboard root within the React Router context (no leading slash)
            navigate('/', { replace: true });
        } catch (err) {
            // Failed to create box - error handled by toast
            error(t('boxCreate.createError'));
        }
    };

    return (
        <ModernContainer>
            <div className="modern-page-container">
                {/* Fixed Title Bar */}
                <div className="modern-title-bar">
                    <div className="modern-title-content">
                        <button 
                            className="modern-back-button"
                            onClick={() => navigate('/')}
                            title={t('common.back')}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="modern-page-title">
                            <h1>{t('boxCreate.title')}</h1>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="modern-content-area">
                    <div className="modern-content-box">
                        <div className="modern-content-scroll">
                            <Form
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/')}
                            submitLabel={t('submit')}
                            cancelLabel={t('Cancel')}
                            initialData={{
                                title: '',
                                description: '',
                                category: 'general'
                            }}
                        >
                            <FormInput
                                label={t('Title')}
                                name="title"
                                placeholder={t('Enter box title')}
                                required
                                maxLength={50}
                            />

                            <FormTextarea
                                label={t('Description')}
                                name="description"
                                placeholder={t('Enter box description')}
                                maxLength={200}
                            />
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </ModernContainer>
    );
}

export default BoxCreate; 