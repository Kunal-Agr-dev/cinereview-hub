import { StarRating } from "./StarRating";
import { User } from "lucide-react";
import { format } from "date-fns";

interface Review {
  review_id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    username: string;
  } | null;
}

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/3 mb-3" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <div
          key={review.review_id}
          className="bg-card rounded-xl p-4 animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {review.users?.username || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>
          <p className="mt-3 text-secondary-foreground leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
