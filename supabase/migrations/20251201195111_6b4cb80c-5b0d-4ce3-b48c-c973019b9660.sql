-- Uniformiser les icônes de catégories : convertir les noms Lucide en emojis
UPDATE blog_categories SET icon = '💡' WHERE icon = 'Lightbulb';
UPDATE blog_categories SET icon = '📰' WHERE icon = 'Newspaper';
UPDATE blog_categories SET icon = '🏷️' WHERE icon = 'Tag';
UPDATE blog_categories SET icon = '⚙️' WHERE icon = 'Settings';
UPDATE blog_categories SET icon = '📊' WHERE icon = 'BarChart';
UPDATE blog_categories SET icon = '🔧' WHERE icon = 'Wrench';
UPDATE blog_categories SET icon = '👥' WHERE icon = 'Users';