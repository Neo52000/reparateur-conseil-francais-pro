import React from 'react';
import { Link } from 'react-router-dom';

/**
 * FAQ Section optimisée pour les Featured Snippets Google
 * Suit les guidelines SEO Machine : question en H2/H3, réponse concise 40-60 mots
 */

const faqs = [
  {
    question: "Comment trouver un réparateur de smartphone près de chez moi ?",
    answer: "Utilisez notre comparateur gratuit : entrez votre ville dans la barre de recherche et comparez instantanément les réparateurs certifiés autour de vous. Consultez les avis, les prix et les délais pour choisir le professionnel qui correspond à vos besoins."
  },
  {
    question: "Combien coûte la réparation d'un écran de téléphone ?",
    answer: "Le prix d'une réparation d'écran varie entre 50€ et 350€ selon le modèle. Un écran iPhone coûte entre 80€ et 350€, un Samsung Galaxy entre 70€ et 300€. Demandez un devis gratuit sur TopRéparateurs pour obtenir le meilleur prix près de chez vous."
  },
  {
    question: "Les réparations sont-elles garanties ?",
    answer: "Oui, toutes les réparations effectuées par nos réparateurs partenaires sont garanties 6 mois minimum. Cette garantie couvre les pièces et la main-d'œuvre. En cas de problème, le réparateur reprend l'appareil sans frais supplémentaires."
  },
  {
    question: "Quels appareils peut-on faire réparer ?",
    answer: "Nos réparateurs prennent en charge les smartphones (iPhone, Samsung, Huawei, Xiaomi), les tablettes (iPad, Galaxy Tab), les ordinateurs portables (MacBook, PC), les consoles de jeux (PS5, Xbox, Nintendo Switch) et d'autres appareils électroniques."
  },
  {
    question: "Quel est le délai de réparation ?",
    answer: "La plupart des réparations courantes (écran, batterie) sont effectuées en 30 minutes à 1 heure. Les réparations plus complexes (carte mère, désoxydation) peuvent prendre 24 à 48 heures. Le délai exact est indiqué lors de la demande de devis."
  }
];

const HomepageFAQSchema: React.FC = () => {
  // Schema.org FAQPage pour Featured Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-16 bg-muted/30" aria-label="Questions fréquentes">
      <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
        <h2 className="text-3xl font-bold text-foreground text-center mb-10">
          Questions fréquentes sur la réparation
        </h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-card rounded-lg border border-border p-6 group"
              {...(index === 0 ? { open: true } : {})}
            >
              <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                <h3 className="text-lg pr-4">{faq.question}</h3>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform text-xl flex-shrink-0" aria-hidden="true">▼</span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/guide-choisir-reparateur" 
            className="text-primary hover:underline font-medium"
          >
            Consultez notre guide complet pour choisir un réparateur →
          </Link>
        </div>
      </div>

      {/* Schema.org FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
};

export default HomepageFAQSchema;
