import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/common/PageTransition';
import Form from '../../components/form/Form';
import FormTextarea from '../../components/form/FormTextarea';
import LabelSelect from '../../components/dashboard/cards/LabelSelect';
import { api } from '../../services/api';
import '../../assets/styles/Form.css';

function AddCard() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        await api.post('/cards', formData);
        navigate('/dashboard');
    };

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="create-box-container">
                        <div className="create-box-header">
                            <h1>{t('addCard.title')}</h1>
                        </div>

                        <div className="create-box-card">
                            <Form
                                onSubmit={handleSubmit}
                                onCancel={() => navigate('/dashboard')}
                                submitLabel={t('addCard.save')}
                                cancelLabel={t('common.cancel')}
                                initialData={{
                                    question: '',
                                    answer: '',
                                    additionalInfo: '',
                                    labels: []
                                }}
                            >
                                <FormTextarea
                                    label={t('addCard.question')}
                                    name="question"
                                    placeholder={t('addCard.questionPlaceholder')}
                                    required
                                    rows={4}
                                />

                                <FormTextarea
                                    label={t('addCard.answer')}
                                    name="answer"
                                    placeholder={t('addCard.answerPlaceholder')}
                                    required
                                    rows={4}
                                />

                                <FormTextarea
                                    label={t('addCard.additionalInfo')}
                                    name="additionalInfo"
                                    placeholder={t('addCard.additionalInfoPlaceholder')}
                                    rows={3}
                                />
                            </Form>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default AddCard; 