import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../components/layout/DashboardContainer';
import PageHeader from '../../components/common/PageHeader';
import Form from '../../components/form/Form';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';

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
            console.error('Failed to create box:', err);
            error(t('boxCreate.createError'));
        }
    };

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('boxCreate.title')} />
                <div className="dashboard-content">
                    <div className="dashboard-box">
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
        </DashboardContainer>
    );
}

export default BoxCreate; 