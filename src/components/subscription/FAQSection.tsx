
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "Comment fonctionne la plateforme ?",
      answer: "Notre plateforme met en relation les clients avec des réparateurs qualifiés près de chez eux. Vous recevez les demandes de réparation dans votre zone, vous proposez vos services et gérez vos interventions via notre interface intuitive."
    },
    {
      question: "Combien de temps faut-il pour voir les premiers résultats ?",
      answer: "La plupart de nos partenaires reçoivent leurs premières demandes dans les 48h suivant l'activation de leur profil. L'augmentation significative de clientèle se ressent généralement après 2-3 semaines d'utilisation active."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Aucun frais caché ! Le prix affiché est le prix final. Vous payez uniquement votre abonnement mensuel ou annuel selon le plan choisi. Pas de commission sur les réparations, pas de frais de mise en service."
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment sans frais ni pénalités. L'annulation prend effet à la fin de votre période de facturation en cours."
    },
    {
      question: "Comment sont sélectionnés les clients ?",
      answer: "Nous pré-qualifions tous les clients avant de vous transmettre leurs demandes. Nous vérifions la sérieux de la demande, la localisation et nous nous assurons que le besoin correspond à vos compétences."
    },
    {
      question: "Que se passe-t-il si je ne suis pas satisfait ?",
      answer: "Nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait de nos services, nous vous remboursons intégralement votre premier mois."
    },
    {
      question: "Quels types de réparations sont couverts ?",
      answer: "Nous couvrons tous les types de réparations : smartphones, tablettes, ordinateurs, consoles de jeux, montres connectées, et bien plus. Vous pouvez spécifier vos domaines d'expertise dans votre profil."
    },
    {
      question: "Comment fonctionne le support client ?",
      answer: "Notre équipe support est disponible 7j/7 par téléphone, email et chat. Vous avez également accès à un conseiller dédié qui vous aide à optimiser votre profil et vos performances."
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              Questions fréquentes
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Trouvez rapidement les réponses à vos questions les plus courantes
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-center text-xl">
              Tout ce que vous devez savoir avant de commencer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100">
                  <AccordionTrigger className="px-6 py-4 text-left hover:bg-gray-50">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Une autre question ?</h3>
            <p className="text-blue-100 mb-4">
              Notre équipe est là pour vous aider ! Contactez-nous pour obtenir des réponses personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+33123456789" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                📞 01 23 45 67 89
              </a>
              <a href="mailto:contact@techrepair.fr" className="bg-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors">
                ✉️ contact@techrepair.fr
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
