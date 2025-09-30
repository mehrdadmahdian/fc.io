import React from 'react';
import { useTranslation } from 'react-i18next';

function PresentationControls({ settings, onSettingChange, totalCards, filteredCards }) {
    const { t } = useTranslation();

    return (
        <div className="presentation-controls">
            <h3>{t('presentation.settings')}</h3>
            
            <div className="controls-grid">
                {/* Slide Duration */}
                <div className="control-group">
                    <label className="control-label">
                        <i className="fas fa-clock"></i>
                        {t('presentation.slideDuration')}
                    </label>
                    <select 
                        value={settings.duration} 
                        onChange={(e) => onSettingChange('duration', parseInt(e.target.value))}
                        className="control-select"
                    >
                        <option value={2000}>2 {t('presentation.seconds')}</option>
                        <option value={3000}>3 {t('presentation.seconds')}</option>
                        <option value={5000}>5 {t('presentation.seconds')}</option>
                        <option value={8000}>8 {t('presentation.seconds')}</option>
                        <option value={10000}>10 {t('presentation.seconds')}</option>
                        <option value={15000}>15 {t('presentation.seconds')}</option>
                        <option value={30000}>30 {t('presentation.seconds')}</option>
                        <option value={60000}>1 {t('presentation.minute')}</option>
                    </select>
                </div>

                {/* Show Sequence */}
                <div className="control-group">
                    <label className="control-label">
                        <i className="fas fa-eye"></i>
                        {t('presentation.showSequence')}
                    </label>
                    <select 
                        value={settings.sequence} 
                        onChange={(e) => onSettingChange('sequence', e.target.value)}
                        className="control-select"
                    >
                        <option value="both">{t('presentation.bothSides')}</option>
                        <option value="front-only">{t('presentation.frontOnly')}</option>
                        <option value="back-only">{t('presentation.backOnly')}</option>
                    </select>
                </div>

                {/* Card Filter */}
                <div className="control-group">
                    <label className="control-label">
                        <i className="fas fa-filter"></i>
                        {t('presentation.cardFilter')}
                    </label>
                    <select 
                        value={settings.filter} 
                        onChange={(e) => onSettingChange('filter', e.target.value)}
                        className="control-select"
                    >
                        <option value="all">{t('cards.all')} ({totalCards})</option>
                        <option value="new">{t('cards.new')}</option>
                        <option value="learning">{t('cards.learning')}</option>
                        <option value="review">{t('cards.review')}</option>
                    </select>
                    {settings.filter !== 'all' && (
                        <small className="control-hint">
                            {filteredCards} {t('cards.filtered')} / {totalCards} {t('cards.total')}
                        </small>
                    )}
                </div>

                {/* Loop Setting */}
                <div className="control-group">
                    <label className="control-label">
                        <i className="fas fa-sync-alt"></i>
                        {t('presentation.playback')}
                    </label>
                    <div className="control-checkbox">
                        <input
                            type="checkbox"
                            id="loop-setting"
                            checked={settings.loop}
                            onChange={(e) => onSettingChange('loop', e.target.checked)}
                        />
                        <label htmlFor="loop-setting">
                            {t('presentation.loopContinuously')}
                        </label>
                    </div>
                </div>

                {/* Show Hints */}
                <div className="control-group">
                    <label className="control-label">
                        <i className="fas fa-lightbulb"></i>
                        {t('presentation.display')}
                    </label>
                    <div className="control-checkboxes">
                        <div className="control-checkbox">
                            <input
                                type="checkbox"
                                id="show-hint"
                                checked={settings.showHint}
                                onChange={(e) => onSettingChange('showHint', e.target.checked)}
                            />
                            <label htmlFor="show-hint">
                                {t('cards.hint')}
                            </label>
                        </div>
                        <div className="control-checkbox">
                            <input
                                type="checkbox"
                                id="show-extra"
                                checked={settings.showExtra}
                                onChange={(e) => onSettingChange('showExtra', e.target.checked)}
                            />
                            <label htmlFor="show-extra">
                                {t('cards.extra')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls-info">
                <div className="info-item">
                    <i className="fas fa-info-circle"></i>
                    <span>{t('presentation.keyboardControls')}</span>
                </div>
                <div className="keyboard-shortcuts">
                    <div className="shortcut">
                        <kbd>Space</kbd> <span>{t('presentation.playPause')}</span>
                    </div>
                    <div className="shortcut">
                        <kbd>←</kbd><kbd>→</kbd> <span>{t('presentation.navigate')}</span>
                    </div>
                    <div className="shortcut">
                        <kbd>F</kbd> <span>{t('presentation.fullscreen')}</span>
                    </div>
                    <div className="shortcut">
                        <kbd>Esc</kbd> <span>{t('presentation.exitPresentation')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PresentationControls;
