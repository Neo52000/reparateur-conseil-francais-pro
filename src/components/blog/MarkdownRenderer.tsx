import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content?.trim()) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucun contenu à afficher</p>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mb-6 mt-8 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-foreground mb-4 leading-relaxed">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-6 py-2 mb-6 bg-muted/50 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">{children}</li>
          ),
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return isInline ? (
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-primary text-primary-foreground p-4 rounded-lg overflow-x-auto mb-6">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-3 bg-muted font-semibold text-left text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-3 text-foreground">{children}</td>
          ),
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <div className="my-6">
              <img 
                src={src} 
                alt={alt || 'Image'} 
                className="max-w-full h-auto rounded-lg shadow-sm"
                loading="lazy"
                onError={(e) => {
                  console.error('Image failed to load:', src);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ),
          hr: () => (
            <hr className="border-border my-8" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          // Support des tâches GitHub Flavored Markdown
          input: ({ type, checked, ...props }) => (
            type === 'checkbox' ? (
              <input 
                type="checkbox" 
                checked={checked} 
                readOnly 
                className="mr-2 accent-primary"
                {...props}
              />
            ) : (
              <input {...props} />
            )
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;