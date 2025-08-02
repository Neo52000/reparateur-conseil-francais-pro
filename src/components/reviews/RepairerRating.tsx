import React from "react";
import { Star } from "lucide-react";

interface RepairerRatingProps {
  averageRating: number;
  totalReviews: number;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const RepairerRating: React.FC<RepairerRatingProps> = ({ 
  averageRating, 
  totalReviews, 
  showText = true,
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.round(averageRating);
      
      return (
        <Star
          key={index}
          className={`${sizeClasses[size]} ${
            isFilled 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          }`}
        />
      );
    });
  };

  if (totalReviews === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {renderStars()}
        </div>
        {showText && (
          <span className={`${textSizeClasses[size]} text-muted-foreground`}>
            Aucun avis
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {averageRating.toFixed(1)} ({totalReviews} avis)
        </span>
      )}
    </div>
  );
};

export default RepairerRating;