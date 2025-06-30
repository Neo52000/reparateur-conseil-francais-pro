
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'highlight.js/styles/github.css';

interface ContentPreviewProps {
  content: string;
  title?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, title = "Aperçu" }) => {
  if (!content?.trim()) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Aucun contenu à prévisualiser</p>
            <p className="text-sm mt-2">Commencez à écrire pour voir l'aperçu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Personnalisation des composants
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700">{children}</li>
              ),
              code: ({ children, className, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                return isInline ? (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="block bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto" {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-200 px-4 py-2 bg-gray-50 font-semibold text-left">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-200 px-4 py-2">{children}</td>
              ),
              a: ({ children, href }) => (
                <a 
                  href={href} 
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto rounded-lg shadow-sm mb-4"
                />
              ),
              // Support des tâches GitHub Flavored Markdown
              input: ({ type, checked, ...props }) => (
                type === 'checkbox' ? (
                  <input 
                    type="checkbox" 
                    checked={checked} 
                    readOnly 
                    className="mr-2"
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
      </CardContent>
    </Card>
  );
};

export default ContentPreview;
