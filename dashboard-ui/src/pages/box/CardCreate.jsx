import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../components/layout/DashboardContainer';
import Form from '../../components/form/Form';
import FormTextarea from '../../components/form/FormTextarea';
import { api } from '../../services/api';
import '../../assets/styles/Dashboard.css';
import '../../assets/styles/Form.css';
import '../../assets/styles/PageHeader.css';
import PageHeader from '../../components/common/PageHeader';

function CardCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { boxId } = useParams();

    const handleSubmit = async (formData) => {
        // Validate required fields
        if (!formData.question || !formData.answer) {
            alert(t('common.fillRequiredFields')); // Or use your preferred notification method
            return;
        }

        try {
            await api.post(`/dashboard/boxes/${boxId}/cards`, formData);
            navigate('/');
        } catch (error) {
            console.error('Error creating card:', error);
            // Handle error appropriately
        }
    };

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('cardCreate.title')} />
                <div className="dashboard-content">
                    <div className="dashboard-box">
                        <Form
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/dashboard')}
                            submitLabel={t('cardCreate.save')}
                            cancelLabel={t('common.cancel')}
                            initialData={{
                                question: '',
                                answer: '',
                                additionalInfo: '',
                                labels: []
                            }}
                            validateForm={true}
                        >
                            <FormTextarea
                                label={`${t('cardCreate.question')} *`}
                                name="question"
                                required={true}
                                placeholder={t('cardCreate.questionPlaceholder')}
                                rows={4}
                            />

                            <FormTextarea
                                label={`${t('cardCreate.answer')} *`}
                                name="answer"
                                placeholder={t('cardCreate.answerPlaceholder')}
                                required={true}
                                rows={4}
                            />

                            <FormTextarea
                                label={t('cardCreate.additionalInfo')}
                                name="additionalInfo"
                                placeholder={t('cardCreate.additionalInfoPlaceholder')}
                                rows={3}
                            />
                        </Form>
                    </div>
                </div>
            </div>
        </DashboardContainer>
    );
}

export default CardCreate; 