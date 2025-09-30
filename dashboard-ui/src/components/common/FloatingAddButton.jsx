import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import QuickAddCardModal from './QuickAddCardModal';
import '../../assets/styles/FloatingAddButton.css';

const FloatingAddButton = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeBox, setActiveBox] = useState(null);
    const [boxes, setBoxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchActiveBox();
        fetchUserBoxes();
    }, []);

    const fetchActiveBox = async () => {
        try {
            const response = await api.get('/dashboard/boxes/active');
            setActiveBox(response.data.data.activeBox);
        } catch (error) {
            console.error('Error fetching active box:', error);
            setActiveBox(null);
        }
    };

    const fetchUserBoxes = async () => {
        try {
            const response = await api.get('/dashboard/boxes');
            setBoxes(response.data.data.boxes || []);
        } catch (error) {
            console.error('Error fetching user boxes:', error);
            setBoxes([]);
        }
    };

    // Hide button on creation/edit pages
    const shouldHideButton = () => {
        const currentPath = location.pathname;
        return (
            currentPath === '/box/create' ||
            currentPath.includes('/cards/create') ||
            currentPath.includes('/cards/') && currentPath.includes('/edit')
        );
    };

    const handleAddCard = () => {
        if (boxes.length === 0) {
            // Navigate to box creation if no boxes exist
            navigate('/box/create');
        } else {
            // Open quick add modal
            setIsModalOpen(true);
        }
    };

    const getTooltipText = () => {
        if (boxes.length === 0) {
            return t('floatingAdd.createBoxFirst');
        } else if (activeBox) {
            return t('floatingAdd.quickAddToBox', { boxName: activeBox.Name });
        } else {
            return t('floatingAdd.quickAddCard');
        }
    };

    // Don't render on creation/edit pages
    if (shouldHideButton()) {
        return null;
    }

    return (
        <>
            <button 
                className={`floating-add-btn ${boxes.length === 0 ? 'no-boxes' : ''}`}
                onClick={handleAddCard}
                title={getTooltipText()}
            >
                <div className="add-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.75a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6a.75.75 0 01.75-.75z" />
                    </svg>
                </div>
                
                {boxes.length === 0 && (
                    <div className="no-active-warning">
                        <span>{t('floatingAdd.noBoxes')}</span>
                    </div>
                )}
            </button>

            {/* Quick Add Card Modal */}
            <QuickAddCardModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                boxes={boxes}
                activeBox={activeBox}
                onCardCreated={() => {
                    setIsModalOpen(false);
                    // Optionally refresh active box or notify parent
                }}
            />
        </>
    );
};

export default FloatingAddButton;
