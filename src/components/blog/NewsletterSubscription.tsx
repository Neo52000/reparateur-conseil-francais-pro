
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Check } from 'lucide-react';
import { useBlog } from '@/hooks/useBlog';

const NewsletterSubscription: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { subscribeToNewsletter } = useBlog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await subscribeToNewsletter.mutateAsync({ email, name: name || undefined });
      setIsSubscribed(true);
      setEmail('');
      setName('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-green-600 mb-2">
            <Check className="h-8 w-8 mx-auto" />
          </div>
          <h3 className="font-semibold text-green-800 mb-1">Inscription réussie !</h3>
          <p className="text-sm text-green-700">
            Vous recevrez nos dernières actualités par email.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Newsletter</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Recevez nos derniers articles et actualités directement dans votre boîte mail.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Votre nom (optionnel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={subscribeToNewsletter.isPending}
          >
            {subscribeToNewsletter.isPending ? 'Inscription...' : "S'abonner"}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-3">
          Pas de spam, désabonnement facile à tout moment.
        </p>
      </CardContent>
    </Card>
  );
};

export default NewsletterSubscription;
