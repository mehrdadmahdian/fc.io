import { useTranslation } from 'react-i18next';

function CardPreview({ card }) {
    const { t } = useTranslation();

    return (
        <div className="card-preview">
            <div className="preview-section">
                <div className="preview-content">
                    <div className="preview-question">
                        {card.question}
                    </div>
                </div>
            </div>

            <div className="preview-divider" />

            <div className="preview-section">
                <div className="preview-content">
                    <div className="preview-answer">
                        {card.answer}
                    </div>
                    {card.additionalInfo && (
                        <div className="preview-additional">
                            {card.additionalInfo}
                        </div>
                    )}
                </div>
            </div>

            {card.labels?.length > 0 && (
                <div className="preview-labels">
                    {card.labels.map(label => (
                        <span 
                            key={label.id}
                            className="preview-label"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CardPreview; 