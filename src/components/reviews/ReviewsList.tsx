import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReviewCard from "./ReviewCard";
import RepairerRating from "./RepairerRating";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  client_name?: string;
}

interface ReviewsListProps {
  repairerId: string;
  showAddReviewButton?: boolean;
  onAddReviewClick?: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  repairerId, 
  showAddReviewButton = false,
  onAddReviewClick 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState("all");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id
        `)
        .eq('repairer_id', repairerId);

      // Apply rating filter
      if (filterRating !== "all") {
        query = query.eq('rating', parseInt(filterRating));
      }

      // Apply sorting
      if (sortBy === "recent") {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === "highest") {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === "lowest") {
        query = query.order('rating', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add mock client names for demo
      const reviewsWithNames = data?.map(review => ({
        ...review,
        client_name: `Client ${review.user_id.slice(0, 4)}`,
      })) || [];

      setReviews(reviewsWithNames);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [repairerId, sortBy, filterRating]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Avis clients</CardTitle>
          {showAddReviewButton && (
            <Button onClick={onAddReviewClick} size="sm">
              Laisser un avis
            </Button>
          )}
        </div>
        
        {reviews.length > 0 && (
          <div className="mt-4">
            <RepairerRating 
              averageRating={averageRating}
              totalReviews={reviews.length}
              size="lg"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucun avis pour ce réparateur
            </p>
            {showAddReviewButton && (
              <Button 
                onClick={onAddReviewClick} 
                className="mt-4"
                variant="outline"
              >
                Être le premier à laisser un avis
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres:</span>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="oldest">Plus anciens</SelectItem>
                  <SelectItem value="highest">Mieux notés</SelectItem>
                  <SelectItem value="lowest">Moins bien notés</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les notes</SelectItem>
                  <SelectItem value="5">5 étoiles</SelectItem>
                  <SelectItem value="4">4 étoiles</SelectItem>
                  <SelectItem value="3">3 étoiles</SelectItem>
                  <SelectItem value="2">2 étoiles</SelectItem>
                  <SelectItem value="1">1 étoile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Show more button */}
            {reviews.length > 3 && !showAllReviews && (
              <div className="text-center mt-6">
                <Button 
                  onClick={() => setShowAllReviews(true)}
                  variant="outline"
                  className="w-full"
                >
                  Voir tous les avis ({reviews.length})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {showAllReviews && reviews.length > 3 && (
              <div className="text-center mt-6">
                <Button 
                  onClick={() => setShowAllReviews(false)}
                  variant="outline"
                  size="sm"
                >
                  Voir moins
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;