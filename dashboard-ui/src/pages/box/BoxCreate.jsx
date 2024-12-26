import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import PageTransition from '../../components/common/PageTransition';
import Form from '../../components/form/Form';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
// import FormSelect from '../../components/form/FormSelect';
import { api } from '../../services/api';
import '../../assets/styles/BoxCreate.css';
import '../../assets/styles/Form.css';
import PageHeader from '../../components/common/PageHeader';

function BoxCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();


    const handleSubmit = async (formData) => {
        await api.post('/boxes', formData);
        navigate('/dashboard');
    };

    return (
        <PageTransition>
            <div className="dashboard-layout">
                <Navigation />
                <main className="dashboard-main">
                    <div className="create-box-container">
                        <PageHeader title={t('boxCreate.title')} />
                        
                        <div className="create-box-card">
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
                </main>
                <Footer />
            </div>
        </PageTransition>
    );
}

export default BoxCreate; 