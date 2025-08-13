import { useTranslation } from 'react-i18next';
import MarkdownContent from '../../common/MarkdownContent';

function CardPreview({ card }) {
    const { t } = useTranslation();

    return (
        <div className="card-preview">
            <div className="preview-section">
                <div className="preview-content">
                    <div className="preview-question">
                        <MarkdownContent content={card.question} className="preview-question-content" />
                    </div>
                </div>
            </div>

            <div className="preview-divider" />

            <div className="preview-section">
                <div className="preview-content">
                    <div className="preview-answer">
                        <MarkdownContent content={card.answer} className="preview-answer-content" />
                    </div>
                    {card.additionalInfo && (
                        <div className="preview-additional">
                            <MarkdownContent content={card.additionalInfo} className="preview-additional-content" />
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