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
import '../../assets/styles/PageHeader.css';
import PageHeader from '../../components/common/PageHeader';

function CardCreate() {
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
                        <PageHeader title={t('cardCreate.title')} />
                        
                        <div className="create-box-card">
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
                            >
                                <FormTextarea
                                    label={t('cardCreate.question')}
                                    name="question"
                                    placeholder={t('cardCreate.questionPlaceholder')}
                                    required
                                    rows={4}
                                />

                                <FormTextarea
                                    label={t('cardCreate.answer')}
                                    name="answer"
                                    placeholder={t('cardCreate.answerPlaceholder')}
                                    required
                                    rows={4}
                                />

                                <FormTextarea
                                    label={t('cardCreate.additionalInfo')}
                                    name="additionalInfo"
                                    placeholder={t('cardCreate.additionalInfoPlaceholder')}
                                    rows={3}
                                />

                                <div className="form-group">
                                    <label>{t('cardCreate.labels')}</label>
                                    <LabelSelect
                                        name="labels"
                                        selectedLabels={[]}
                                        onChange={() => {}}
                                    />
                                </div>
                            </Form>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default CardCreate; 