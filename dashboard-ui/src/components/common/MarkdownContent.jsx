import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

function MarkdownContent({ content, className = '' }) {
    if (!content) return null;

    return (
        <div className={`markdown-content ${className}`}>
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
                    },
                    // Style headings for card display
                    h1: ({ children }) => <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{children}</h3>,
                    // Style paragraphs for better spacing
                    p: ({ children }) => <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>{children}</p>,
                    // Style lists
                    ul: ({ children }) => <ul style={{ marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                    // Style blockquotes
                    blockquote: ({ children }) => (
                        <blockquote style={{ 
                            borderLeft: '4px solid #e2e8f0', 
                            paddingLeft: '1rem', 
                            margin: '1rem 0',
                            fontStyle: 'italic',
                            color: '#6b7280'
                        }}>
                            {children}
                        </blockquote>
                    ),
                    // Style tables
                    table: ({ children }) => (
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            margin: '1rem 0',
                            fontSize: '0.875rem'
                        }}>
                            {children}
                        </table>
                    ),
                    th: ({ children }) => (
                        <th style={{ 
                            border: '1px solid #e2e8f0', 
                            padding: '0.5rem', 
                            background: '#f8fafc',
                            fontWeight: '600',
                            textAlign: 'left'
                        }}>
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td style={{ 
                            border: '1px solid #e2e8f0', 
                            padding: '0.5rem'
                        }}>
                            {children}
                        </td>
                    ),
                    // Style links
                    a: ({ children, href }) => (
                        <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#3b82f6', 
                                textDecoration: 'underline'
                            }}
                        >
                            {children}
                        </a>
                    ),
                    // Style inline code
                    inlineCode: ({ children }) => (
                        <code style={{ 
                            background: '#f1f5f9', 
                            padding: '0.125rem 0.25rem', 
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            color: '#dc2626'
                        }}>
                            {children}
                        </code>
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default MarkdownContent;
