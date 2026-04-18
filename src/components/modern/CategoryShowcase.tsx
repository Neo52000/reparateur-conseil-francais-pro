import { Link } from 'react-router-dom';
import { Smartphone, Tablet, Laptop, Gamepad2, ArrowRight } from 'lucide-react';

const categories = [
  {
    icon: Smartphone,
    label: 'Smartphone',
    description: 'Écran, batterie, connecteur…',
    to: '/reparation-smartphone',
    accent: 'from-primary/10 to-primary/5 text-primary',
  },
  {
    icon: Laptop,
    label: 'Ordinateur',
    description: 'Portable, fixe, Mac, PC',
    to: '/reparation-ordinateur',
    accent: 'from-accent/10 to-accent/5 text-accent',
  },
  {
    icon: Tablet,
    label: 'Tablette',
    description: 'iPad, Samsung, Huawei…',
    to: '/reparation-tablette',
    accent: 'from-primary/10 to-primary/5 text-primary',
  },
  {
    icon: Gamepad2,
    label: 'Console',
    description: 'PS, Xbox, Switch…',
    to: '/reparation-console',
    accent: 'from-accent/10 to-accent/5 text-accent',
  },
];

const CategoryShowcase = () => (
  <section className="py-16 md:py-20 bg-background" aria-label="Catégories de réparation">
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
          Quel appareil souhaitez-vous réparer ?
        </h2>
        <p className="text-muted-foreground">
          Choisissez la catégorie qui correspond à votre panne pour découvrir les réparateurs spécialisés.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              to={cat.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elev-1 transition-all duration-300 hover:shadow-elev-3 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${cat.accent} mb-4`}>
                <Icon className="w-6 h-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold mb-1">{cat.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Voir les réparateurs
                <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CategoryShowcase;
