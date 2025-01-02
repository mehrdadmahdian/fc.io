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
        if (!formData.front || !formData.back) {
            alert(t('common.fillRequiredFields'));
            return;
        }

        try {
            await api.post(`/dashboard/boxes/${boxId}/cards`, formData);
            navigate('/');
        } catch (error) {
        }
    };

    return (
        <DashboardContainer>
            <div className="dashboard-container">
                <PageHeader title={t('cardCreate.title')} />
                <div className="dashboard-content">
                    <div className="dashboard-box" style={{ width: '100%', maxWidth: 'none', padding: '20px' }}>
                        <Form
                            style={{ width: '100%' }}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/dashboard')}
                            submitLabel={t('cardCreate.save')}
                            cancelLabel={t('common.cancel')}
                            initialData={{
                                front: '',
                                back: '',
                                extra: '',
                                labels: []
                            }}
                            validateForm={true}
                        >
                            <FormTextarea
                                label={`${t('cardCreate.question')} *`}
                                name="front"
                                required={true}
                                placeholder={t('cardCreate.questionPlaceholder')}
                                rows={4}
                            />

                            <FormTextarea
                                label={`${t('cardCreate.answer')} *`}
                                name="back"
                                placeholder={t('cardCreate.answerPlaceholder')}
                                required={true}
                                rows={4}
                            />

                            <FormTextarea
                                label={t('cardCreate.additionalInfo')}
                                name="extra"
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