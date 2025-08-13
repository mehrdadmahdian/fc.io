import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

function FormMarkdownTextarea({ 
    label, 
    name, 
    value = '', 
    onChange, 
    placeholder, 
    required, 
    rows = 6, 
    maxLength,
    error,
    disabled 
}) {
    const { t } = useTranslation();
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    const togglePreview = () => {
        setIsPreviewMode(!isPreviewMode);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const insertMarkdown = (syntax) => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = value.substring(start, end);
            
            let newText = '';
            switch (syntax) {
                case 'bold':
                    newText = `**${selectedText || 'bold text'}**`;
                    break;
                case 'italic':
                    newText = `*${selectedText || 'italic text'}*`;
                    break;
                case 'code':
                    newText = `\`${selectedText || 'code'}\``;
                    break;
                case 'codeblock':
                    newText = `\`\`\`\n${selectedText || 'code here'}\n\`\`\``;
                    break;
                case 'list':
                    newText = `- ${selectedText || 'list item'}`;
                    break;
                case 'numbered':
                    newText = `1. ${selectedText || 'numbered item'}`;
                    break;
                case 'quote':
                    newText = `> ${selectedText || 'quote'}`;
                    break;
                case 'link':
                    newText = `[${selectedText || 'link text'}](url)`;
                    break;
                default:
                    return;
            }

            const newValue = value.substring(0, start) + newText + value.substring(end);
            const event = { target: { name, value: newValue } };
            if (onChange) {
                onChange(event);
            }

            // Set cursor position after the inserted text
            setTimeout(() => {
                const newCursorPos = start + newText.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
                textarea.focus();
            }, 0);
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    const containerClass = `markdown-textarea-container ${isFullscreen ? 'fullscreen' : ''}`;

    return (
        <div className="form-group">
            <label htmlFor={name} className="markdown-label">
                {label}
                {required && <span className="required-asterisk">*</span>}
            </label>
            
            <div className="markdown-input-container">
                <div className="markdown-content">
                    {!isPreviewMode ? (
                        <textarea
                            ref={textareaRef}
                            id={name}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            placeholder={placeholder}
                            rows={isFullscreen ? 20 : rows}
                            maxLength={maxLength}
                            required={required}
                            disabled={disabled}
                            className="markdown-textarea"
                        />
                    ) : (
                        <div className="markdown-preview">
                            {value ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={tomorrow}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {value}
                                </ReactMarkdown>
                            ) : (
                                <div className="preview-placeholder">
                                    {t('cardCreate.noPreview')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="markdown-toolbar-side">
                    <button 
                        type="button" 
                        className="toolbar-btn" 
                        onClick={() => insertMarkdown('bold')}
                        title="Bold"
                        disabled={disabled}
                    >
                        <strong>B</strong>
                    </button>
                    <button 
                        type="button" 
                        className="toolbar-btn" 
                        onClick={() => insertMarkdown('italic')}
                        title="Italic"
                        disabled={disabled}
                    >
                        <em>I</em>
                    </button>
                    <button 
                        type="button" 
                        className="toolbar-btn" 
                        onClick={() => insertMarkdown('code')}
                        title="Code"
                        disabled={disabled}
                    >
                        {'</>'}
                    </button>
                    <button 
                        type="button" 
                        className="toolbar-btn" 
                        onClick={() => insertMarkdown('list')}
                        title="List"
                        disabled={disabled}
                    >
                        •
                    </button>
                    <button 
                        type="button" 
                        className="toolbar-btn" 
                        onClick={() => insertMarkdown('link')}
                        title="Link"
                        disabled={disabled}
                    >
                        🔗
                    </button>
                    <div className="toolbar-divider"></div>
                    <button 
                        type="button" 
                        className={`toolbar-btn ${isPreviewMode ? 'active' : ''}`}
                        onClick={togglePreview}
                        title="Preview"
                        disabled={disabled}
                    >
                        👁
                    </button>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}
            {maxLength && (
                <div className="character-count">
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    );
}

export default FormMarkdownTextarea;
