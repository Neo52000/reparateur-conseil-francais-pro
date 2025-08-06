
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
      {reviewCount !== undefined && (
        <span className="ml-2 text-sm text-gray-600">
          {reviewCount} avis
        </span>
      )}
    </div>
  );
};

export default StarRating;
