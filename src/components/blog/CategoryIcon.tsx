import { 
  Lightbulb, 
  Newspaper, 
  Tag, 
  Settings, 
  BarChart, 
  Wrench, 
  Users,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  icon?: string;
  className?: string;
}

const lucideIconMap: Record<string, React.ComponentType<any>> = {
  'Lightbulb': Lightbulb,
  'Newspaper': Newspaper,
  'Tag': Tag,
  'Settings': Settings,
  'BarChart': BarChart,
  'Wrench': Wrench,
  'Users': Users,
};

export const CategoryIcon = ({ icon, className = "h-4 w-4" }: CategoryIconProps) => {
  if (!icon) return null;

  // Si c'est un emoji, l'afficher directement
  if (/\p{Emoji}/u.test(icon)) {
    return <span className="text-base">{icon}</span>;
  }

  // Si c'est un nom d'icône Lucide, rendre le composant
  const IconComponent = lucideIconMap[icon];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Fallback: afficher l'icône de question
  return <HelpCircle className={className} />;
};
