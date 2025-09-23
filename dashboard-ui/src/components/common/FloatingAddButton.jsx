import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import '../../assets/styles/FloatingAddButton.css';

const FloatingAddButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeBox, setActiveBox] = useState(null);

    useEffect(() => {
        fetchActiveBox();
    }, []);

    const fetchActiveBox = async () => {
        try {
            console.log('Fetching active box...');
            const response = await api.get('/dashboard/boxes/active');
            console.log('Active box response:', response.data);
            setActiveBox(response.data.data.activeBox);
        } catch (error) {
            console.error('Error fetching active box:', error);
            setActiveBox(null);
        }
    };

    const handleAddCard = () => {
        if (activeBox) {
            navigate(`/box/${activeBox.ID}/cards/create`);
        } else {
            // Navigate to box creation if no active box
            navigate('/box/create');
        }
    };

    const getTooltipText = () => {
        if (activeBox) {
            return t('floatingAdd.addToActiveBox', { boxName: activeBox.Name });
        } else {
            return t('floatingAdd.createBoxFirst');
        }
    };

    console.log('FloatingAddButton render - activeBox:', activeBox);

    return (
        <button 
            className={`floating-add-btn ${!activeBox ? 'no-active-box' : ''}`}
            onClick={handleAddCard}
            title={getTooltipText()}
        >
            <div className="add-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.75a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6a.75.75 0 01.75-.75z" />
                </svg>
            </div>
            
            {!activeBox && (
                <div className="no-active-warning">
                    <span>{t('floatingAdd.noActiveBox')}</span>
                </div>
            )}
        </button>
    );
};

export default FloatingAddButton;
