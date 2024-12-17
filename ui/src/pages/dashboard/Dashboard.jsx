import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BoxCard from '../../components/dashboard/BoxCard';

function Dashboard() {
    const [boxes, setBoxes] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        // Fetch boxes from your API
        const fetchBoxes = async () => {
            try {
                const response = await fetch('/api/boxes');
                const data = await response.json();
                setBoxes(data);
            } catch (error) {
                console.error('Error fetching boxes:', error);
            }
        };

        fetchBoxes();
    }, []);

    return (
        <div className="dashboard">
            <h1>{t('dashboard.title')}</h1>
            <div className="boxes-container">
                {boxes.map(box => (
                    <BoxCard key={box.id} box={box} />
                ))}
            </div>
        </div>
    );
}

export default Dashboard; 