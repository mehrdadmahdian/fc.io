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
import { useEffect, useState } from 'react';

function CardCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { boxId, cardId } = useParams();
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        extra: ''
    });
    const [loading, setLoading] = useState(cardId ? true : false);

    useEffect(() => {
        if (cardId) {
            const fetchCard = async () => {
                try {
                    const response = await api.get(`/dashboard/boxes/${boxId}/cards/${cardId}`);
                    setFormData({
                        front: response.data.data.card.Front,
                        back: response.data.data.card.Back,
                        extra: response.data.data.card.Extra || ''
                    });
                } catch (err) {
                    console.error('Error fetching card:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [boxId, cardId]);

    const handleSubmit = async (formData) => {
        try {
            if (cardId) {
                // Update existing card
                await api.put(`/dashboard/boxes/${boxId}/cards/${cardId}`, formData);
            } else {
                // Create new card
                await api.post(`/dashboard/boxes/${boxId}/cards`, formData);
            }
            navigate(`/box/${boxId}/review`);
        } catch (err) {
            console.error('Error saving card:', err);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                                front: formData.front,
                                back: formData.back,
                                extra: formData.extra,
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