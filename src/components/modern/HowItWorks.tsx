import { Link } from 'react-router-dom';
import { Search, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Décrivez votre panne',
    description:
      "Indiquez votre appareil et votre ville, ou utilisez notre diagnostic IA pour identifier le problème.",
  },
  {
    num: '02',
    icon: FileText,
    title: 'Comparez les devis',
    description:
      'Recevez plusieurs devis gratuits de réparateurs certifiés. Prix, délais, garanties et avis — tout en un coup d’œil.',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Réservez et faites réparer',
    description:
      'Choisissez le réparateur qui vous convient, réservez en ligne et suivez la progression de votre réparation.',
  },
];

const HowItWorks = () => (
  <section
    className="py-16 md:py-20 bg-surface-1 border-y border-border"
    aria-label="Comment ça marche"
  >
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
          Comment ça marche
        </h2>
        <p className="text-muted-foreground">
          Un processus simple en 3 étapes pour trouver et réserver votre réparateur.
        </p>
      </div>

      <ol className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
        {/* Connector line (desktop) */}
        <div
          className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-border -z-0"
          aria-hidden
        />

        {steps.map(step => {
          const Icon = step.icon;
          return (
            <li
              key={step.num}
              className="relative bg-card rounded-2xl border border-border p-6 shadow-elev-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-serif font-bold text-lg shadow-elev-2">
                  {step.num}
                </div>
                <Icon className="w-5 h-5 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 text-center">
        <Link to="/search">
          <Button size="lg" className="shadow-elev-2">
            Commencer ma recherche
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default HowItWorks;
