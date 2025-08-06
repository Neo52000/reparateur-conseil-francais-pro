import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "Puis-je tester la plateforme gratuitement ?",
    answer: "Oui, l'inscription est gratuite avec accès à toutes les fonctionnalités pendant 7 jours."
  },
  {
    question: "Puis-je résilier à tout moment ?",
    answer: "Oui, sans engagement. Vous gérez votre abonnement depuis votre espace réparateur."
  },
  {
    question: "Est-ce que la boutique en ligne est personnalisable ?",
    answer: "Oui, vous choisissez vos produits, couleurs, logo et modes de livraison."
  },
  {
    question: "La solution est-elle conforme NF525 ?",
    answer: "Absolument. Notre système POS est certifié et respecte toutes les obligations légales françaises."
  },
  {
    question: "Comment fonctionne le référencement local ?",
    answer: "Nous créons automatiquement vos pages locales optimisées et vous positionnons sur Google selon vos spécialités."
  },
  {
    question: "Le support est-il inclus ?",
    answer: "Oui, notre équipe technique est disponible 7j/7 pour vous accompagner par chat, email ou téléphone."
  }
];

const SimpleFAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir avant de commencer
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <Card key={index} className="border transition-all duration-200 hover:shadow-md">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-foreground pr-4">
                      {item.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openItems.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-electric-blue" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {openItems.includes(index) && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Vous avez d'autres questions ?
            </p>
            <a 
              href="/repairer/faq" 
              className="text-electric-blue hover:text-electric-blue-dark font-medium underline"
            >
              Consultez notre FAQ complète
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleFAQ;