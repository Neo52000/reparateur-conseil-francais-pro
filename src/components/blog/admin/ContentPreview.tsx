
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentPreviewProps {
  content: string;
  title?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, title = "Aperçu" }) => {
  const formatContent = (text: string): string => {
    if (!text) return '';

    // Remplacer les balises markdown par du formatage visuel
    let formatted = text
      // Gras
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italique
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Titres
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.2em; font-weight: bold; margin: 1em 0 0.5em 0;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.4em; font-weight: bold; margin: 1.2em 0 0.6em 0;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6em; font-weight: bold; margin: 1.4em 0 0.7em 0;">$1</h1>')
      // Listes
      .replace(/^\- (.*$)/gim, '<li style="margin-left: 1.5em;">• $1</li>')
      // Paragraphes
      .replace(/\n\n/g, '</p><p style="margin: 1em 0;">')
      .replace(/\n/g, '<br/>');

    // Ajouter des emojis contextuels
    formatted = addContextualEmojis(formatted);

    return `<div style="line-height: 1.6;"><p style="margin: 1em 0;">${formatted}</p></div>`;
  };

  const addContextualEmojis = (text: string): string => {
    const emojiMap: Record<string, string> = {
      'réparation': '🔧',
      'smartphone': '📱',
      'iPhone': '📱',
      'Samsung': '📱',
      'écran': '📲',
      'batterie': '🔋',
      'problème': '⚠️',
      'solution': '✅',
      'conseil': '💡',
      'astuce': '💡',
      'attention': '⚠️',
      'important': '❗',
      'facile': '😊',
      'difficile': '😅',
      'rapide': '⚡',
      'économie': '💰',
      'prix': '💰',
      'qualité': '⭐',
      'garantie': '🛡️',
      'sécurité': '🔒'
    };

    let result = text;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, `${emoji} ${word}`);
    });

    return result;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </CardContent>
    </Card>
  );
};

export default ContentPreview;
