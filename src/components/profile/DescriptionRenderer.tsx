
import React from 'react';

interface DescriptionRendererProps {
  description: string;
}

const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({ description }) => {
  // Fonction pour préserver le formatage SEO dans la description
  const renderDescription = (description: string) => {
    // Séparer les paragraphes et préserver la structure
    const paragraphs = description.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Traiter les titres en gras (format **Titre**)
      if (paragraph.startsWith('**') && paragraph.includes('**')) {
        const titleMatch = paragraph.match(/^\*\*(.*?)\*\*/);
        if (titleMatch) {
          const title = titleMatch[1];
          const content = paragraph.replace(/^\*\*(.*?)\*\*\s*/, '');
          return (
            <div key={index} className="mb-4">
              <h4 className="font-bold text-lg text-gray-900 mb-2">{title}</h4>
              {content && <p className="text-gray-700 leading-relaxed">{content}</p>}
            </div>
          );
        }
      }
      
      // Traiter les listes à puces (format • item)
      if (paragraph.includes('•') || paragraph.includes('- ')) {
        const lines = paragraph.split('\n');
        const listItems = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('- '));
        const regularText = lines.filter(line => !line.trim().startsWith('•') && !line.trim().startsWith('- ')).join(' ');
        
        return (
          <div key={index} className="mb-4">
            {regularText && <p className="text-gray-700 leading-relaxed mb-2">{regularText}</p>}
            {listItems.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {listItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="leading-relaxed">
                    {item.replace(/^[•-]\s*/, '')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      
      // Paragraphe normal
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="prose prose-gray max-w-none">
      {renderDescription(description)}
    </div>
  );
};

export default DescriptionRenderer;
