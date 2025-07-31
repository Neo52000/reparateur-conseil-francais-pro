-- Fix the ui_themes table by adding the missing description column
ALTER TABLE public.ui_themes ADD COLUMN description TEXT;

-- Now insert the default theme with the correct columns
INSERT INTO public.ui_themes (name, type, theme_data, is_default, css_variables, description) VALUES
('Default Theme', 'system', 
'{"primaryColor": "#3b82f6", "secondaryColor": "#64748b", "accentColor": "#10b981"}',
true,
'{"--primary": "221 83% 53%", "--secondary": "215 16% 47%", "--accent": "160 84% 39%"}',
'Thème par défaut du système'
);