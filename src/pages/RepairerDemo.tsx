import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Clock, Check, Phone, Video, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const timeSlots = [
  "9h00 - 9h30",
  "9h30 - 10h00", 
  "10h00 - 10h30",
  "10h30 - 11h00",
  "11h00 - 11h30",
  "14h00 - 14h30",
  "14h30 - 15h00",
  "15h00 - 15h30",
  "15h30 - 16h00",
  "16h00 - 16h30",
  "16h30 - 17h00",
  "17h00 - 17h30"
];

const demoFeatures = [
  "Démonstration complète du POS NF525",
  "Tour de votre future boutique en ligne",
  "Présentation du module SEO local",
  "Explication du système QualiRépar",
  "Réponses à toutes vos questions",
  "Devis personnalisé selon vos besoins"
];

const RepairerDemo: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    city: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    demoType: 'video'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    console.log('Demo request:', formData);
    
    toast({
      title: "Demande de démo envoyée !",
      description: "Nous vous recontacterons sous 24h pour confirmer votre créneau.",
    });

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      businessName: '',
      city: '',
      preferredDate: '',
      preferredTime: '',
      message: '',
      demoType: 'video'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Réserver une Démo - Découvrez TopRéparateurs en direct | Réparateurs</title>
        <meta 
          name="description" 
          content="Réservez votre démo personnalisée de TopRéparateurs. Découvrez en 30 minutes comment digitaliser votre atelier de réparation." 
        />
        <meta name="keywords" content="démo TopRéparateurs, présentation solution réparateur, découvrir plateforme réparation" />
        <link rel="canonical" href="https://topreparateurs.fr/repairer/demo" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to="/repairer/plans"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux plans
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Réserver une démo</h1>
                <p className="text-muted-foreground mt-2">
                  Découvrez TopRéparateurs en 30 minutes avec un expert
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left column - Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-electric-blue" />
                  Réservez votre créneau
                </CardTitle>
                <p className="text-muted-foreground">
                  Remplissez le formulaire ci-dessous et nous vous recontacterons sous 24h
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prénom *</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom *</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Téléphone *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom de votre entreprise</label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ville</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de démo</label>
                    <Select value={formData.demoType} onValueChange={(value) => handleInputChange('demoType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Visioconférence (recommandé)
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Appel téléphonique
                          </div>
                        </SelectItem>
                        <SelectItem value="inPerson">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Rendez-vous en personne
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date souhaitée</label>
                      <Input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Créneau souhaité</label>
                      <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un créneau" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message (optionnel)</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Dites-nous quels sont vos besoins spécifiques..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-electric-blue hover:bg-electric-blue-dark"
                    size="lg"
                  >
                    Réserver ma démo gratuite
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right column - Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-electric-blue" />
                    Au programme de votre démo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {demoFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-electric-blue text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Pourquoi réserver une démo ?</h3>
                  <div className="space-y-3 text-electric-blue-light">
                    <p>✨ <strong>100% personnalisée</strong> selon votre activité</p>
                    <p>⚡ <strong>30 minutes</strong> pour tout comprendre</p>
                    <p>💬 <strong>Questions/réponses</strong> avec un expert</p>
                    <p>📊 <strong>Devis adapté</strong> à vos besoins</p>
                    <p>🎯 <strong>Sans engagement</strong>, juste pour découvrir</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Déjà convaincu ?</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous pouvez aussi commencer directement votre essai gratuit de 7 jours
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/repairer-auth">
                      Commencer l'essai gratuit
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  🔒 Vos données sont protégées et ne seront jamais partagées.
                </p>
                <p className="mt-2">
                  Des questions ? Appelez-nous au{' '}
                  <a href="tel:+33123456789" className="text-electric-blue hover:underline">
                    01 23 45 67 89
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RepairerDemo;