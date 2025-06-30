
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, MessageCircle, ThumbsUp, ThumbsDown, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

interface ClientReview {
  id: string;
  repairer_id: string;
  quote_id?: string;
  overall_rating: number;
  criteria_ratings: Record<string, number>;
  comment?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderation_notes?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface Quote {
  id: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  repairer_id: string;
  status: string;
}

const ClientReviewsTab = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [reviewCriteria, setReviewCriteria] = useState<ReviewCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null);
  
  // Formulaire d'avis
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [overallRating, setOverallRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadReviews(),
        loadAvailableQuotes(),
        loadReviewCriteria()
      ]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('client_reviews')
      .select('*')
      .eq('client_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReviews(data || []);
  };

  const loadAvailableQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes_with_timeline')
      .select('*')
      .eq('client_id', user?.id)
      .in('status', ['completed', 'accepted'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Filtrer les devis qui n'ont pas encore d'avis
    const reviewedQuoteIds = reviews.map(r => r.quote_id).filter(Boolean);
    const availableQuotes = (data || []).filter(quote => 
      !reviewedQuoteIds.includes(quote.id)
    );
    
    setAvailableQuotes(availableQuotes);
  };

  const loadReviewCriteria = async () => {
    const { data, error } = await supabase
      .from('review_criteria')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    setReviewCriteria(data || []);
  };

  const resetForm = () => {
    setSelectedQuoteId('');
    setOverallRating(0);
    setCriteriaRatings({});
    setComment('');
    setPros('');
    setCons('');
    setWouldRecommend(null);
    setEditingReview(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedQuoteId || overallRating === 0) {
      toast.error('Veuillez sélectionner un devis et donner une note globale');
      return;
    }

    const selectedQuote = availableQuotes.find(q => q.id === selectedQuoteId);
    if (!selectedQuote) {
      toast.error('Devis non trouvé');
      return;
    }

    try {
      const reviewData = {
        client_id: user?.id,
        repairer_id: selectedQuote.repairer_id,
        quote_id: selectedQuoteId,
        overall_rating: overallRating,
        criteria_ratings: criteriaRatings,
        comment: comment.trim() || null,
        pros: pros.trim() || null,
        cons: cons.trim() || null,
        would_recommend: wouldRecommend,
        status: 'pending'
      };

      if (editingReview) {
        const { error } = await supabase
          .from('client_reviews')
          .update(reviewData)
          .eq('id', editingReview.id);

        if (error) throw error;
        toast.success('Avis modifié avec succès');
      } else {
        const { error } = await supabase
          .from('client_reviews')
          .insert(reviewData);

        if (error) throw error;
        toast.success('Avis envoyé avec succès');
      }

      setIsReviewDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde avis:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEditReview = (review: ClientReview) => {
    const quote = availableQuotes.find(q => q.id === review.quote_id);
    if (!quote) return;

    setEditingReview(review);
    setSelectedQuoteId(review.quote_id || '');
    setOverallRating(review.overall_rating);
    setCriteriaRatings(review.criteria_ratings);
    setComment(review.comment || '');
    setPros(review.pros || '');
    setCons(review.cons || '');
    setWouldRecommend(review.would_recommend);
    setIsReviewDialogOpen(true);
  };

  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      approved: { label: 'Approuvé', variant: 'default' as const },
      rejected: { label: 'Rejeté', variant: 'destructive' as const },
      hidden: { label: 'Masqué', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const approgedReviews = reviews.filter(r => r.status === 'approved').length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Avis publiés</p>
                <p className="text-xl font-bold">{approgedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-xl font-bold">{averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold">{pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton nouvel avis */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Donner un avis</h3>
              <p className="text-sm text-gray-600">
                Partagez votre expérience sur les réparations effectuées
              </p>
            </div>
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} disabled={availableQuotes.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel avis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingReview ? 'Modifier l\'avis' : 'Donner un avis'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {!editingReview && (
                    <div>
                      <Label>Sélectionner la réparation *</Label>
                      <Select value={selectedQuoteId} onValueChange={setSelectedQuoteId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une réparation" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableQuotes.map((quote) => (
                            <SelectItem key={quote.id} value={quote.id}>
                              {quote.device_brand} {quote.device_model} - {quote.repair_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="flex items-center gap-2">
                      Note globale * 
                      <span className="text-sm text-gray-500">({overallRating}/5)</span>
                    </Label>
                    {renderStars(overallRating, setOverallRating)}
                  </div>

                  {reviewCriteria.length > 0 && (
                    <div>
                      <Label>Évaluation détaillée</Label>
                      <div className="space-y-3 mt-2">
                        {reviewCriteria.map((criteria) => (
                          <div key={criteria.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{criteria.description}</p>
                            </div>
                            {renderStars(
                              criteriaRatings[criteria.name] || 0,
                              (rating) => setCriteriaRatings(prev => ({
                                ...prev,
                                [criteria.name]: rating
                              }))
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Commentaire général</Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Décrivez votre expérience..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Points positifs</Label>
                      <Textarea
                        value={pros}
                        onChange={(e) => setPros(e.target.value)}
                        placeholder="Ce qui vous a plu..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Points à améliorer</Label>
                      <Textarea
                        value={cons}
                        onChange={(e) => setCons(e.target.value)}
                        placeholder="Ce qui pourrait être amélioré..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Recommanderiez-vous ce réparateur ?</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        variant={wouldRecommend === true ? "default" : "outline"}
                        onClick={() => setWouldRecommend(true)}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Oui
                      </Button>
                      <Button
                        variant={wouldRecommend === false ? "default" : "outline"}
                        onClick={() => setWouldRecommend(false)}
                        className="flex items-center gap-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Non
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitReview}>
                      {editingReview ? 'Modifier' : 'Publier'} l'avis
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <Card>
        <CardHeader>
          <CardTitle>Mes avis ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun avis publié</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const quote = availableQuotes.find(q => q.id === review.quote_id);
                
                return (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {renderStars(review.overall_rating)}
                            <span className="text-sm text-gray-600">
                              {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          {quote && (
                            <p className="text-sm text-gray-600">
                              {quote.device_brand} {quote.device_model} - {quote.repair_type}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(review.status)}
                          {review.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm mb-3">{review.comment}</p>
                      )}

                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          {review.pros && (
                            <div>
                              <h5 className="text-sm font-semibold text-green-700 mb-1">Points positifs</h5>
                              <p className="text-sm text-gray-600">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div>
                              <h5 className="text-sm font-semibold text-orange-700 mb-1">À améliorer</h5>
                              <p className="text-sm text-gray-600">{review.cons}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {review.would_recommend !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          {review.would_recommend ? (
                            <>
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Recommande ce réparateur</span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Ne recommande pas ce réparateur</span>
                            </>
                          )}
                        </div>
                      )}

                      {review.moderation_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-semibold mb-1">Note de modération</h5>
                          <p className="text-sm text-gray-600">{review.moderation_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientReviewsTab;
