
/**
 * Service de détection de format pour le contenu importé
 */

export interface DetectedFormat {
  source: 'claude' | 'chatgpt' | 'notion' | 'markdown' | 'unknown';
  confidence: number;
  features: string[];
}

export class FormatDetector {
  /**
   * Détecte le format source du contenu
   */
  static detectFormat(content: string): DetectedFormat {
    const features: string[] = [];
    let source: DetectedFormat['source'] = 'unknown';
    let confidence = 0;

    // Patterns Claude.ai - plus précis
    const claudePatterns = [
      /```[\w]*\n[\s\S]*?\n```/g, // Code blocks
      /^>\s+/gm, // Blockquotes
      /\*\*[^*]+\*\*/g, // Bold text
      /^#{1,6}\s+/gm // Headers
    ];
    
    let claudeScore = 0;
    claudePatterns.forEach(pattern => {
      if (pattern.test(content)) claudeScore++;
    });
    
    if (claudeScore >= 3) {
      features.push('claude-markdown', 'code-blocks', 'blockquotes', 'bold-text');
      source = 'claude';
      confidence = Math.min(0.9, 0.6 + (claudeScore * 0.1));
    }

    // Patterns ChatGPT
    if (content.match(/^\d+\.\s+/gm) && content.includes('**') && content.includes('###')) {
      features.push('numbered-lists', 'headers', 'bold-text');
      if (source === 'unknown') {
        source = 'chatgpt';
        confidence = 0.7;
      }
    }

    // Patterns Notion - plus spécifique
    const notionEmojis = ['💡', '⚠️', '📝', '✅', '❌', '🔍', '📊', '🎯'];
    const emojiCount = notionEmojis.filter(emoji => content.includes(emoji)).length;
    
    if (emojiCount >= 2) {
      features.push('emoji-callouts', 'rich-formatting');
      if (source === 'unknown') {
        source = 'notion';
        confidence = 0.6 + (emojiCount * 0.05);
      }
    }

    // Standard Markdown
    if (content.includes('# ') || content.includes('## ') || content.includes('- ')) {
      features.push('standard-markdown');
      if (source === 'unknown') {
        source = 'markdown';
        confidence = 0.5;
      }
    }

    return { source, confidence, features };
  }
}
