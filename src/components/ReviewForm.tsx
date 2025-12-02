import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  review_id: string;
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  movieId: string;
  movieTitle: string;
  onReviewSubmitted: () => void;
  editingReview?: Review | null;
  onCancelEdit?: () => void;
}

export function ReviewForm({ 
  movieId, 
  movieTitle, 
  onReviewSubmitted, 
  editingReview,
  onCancelEdit 
}: ReviewFormProps) {
  const { userProfile, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [editingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!userProfile) {
      toast.error("User profile not found. Please try logging in again.");
      return;
    }

    if (rating === 0 || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: comment.trim(),
          })
          .eq("review_id", editingReview.review_id);

        if (error) throw error;
        toast.success("Review updated!");
        onCancelEdit?.();
      } else {
        const { error } = await supabase
          .from("reviews")
          .insert({
            movie_id: movieId,
            user_id: userProfile.user_id,
            rating,
            comment: comment.trim(),
          });

        if (error) throw error;
        toast.success("Review submitted!");
      }

      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-card rounded-xl text-center">
        <p className="text-muted-foreground">
          Please <a href="/auth" className="text-gold hover:underline">sign in</a> to write a review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-xl">
      <div>
        <h3 className="font-display text-2xl golden-text mb-1">
          {editingReview ? "Edit Review" : "Write a Review"}
        </h3>
        <p className="text-muted-foreground text-sm">for {movieTitle}</p>
        <p className="text-sm text-foreground mt-1">
          Reviewing as <span className="text-gold">{userProfile?.username}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Rating <span className="text-destructive">*</span> (1-5)
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Your Review <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          rows={4}
          className="bg-muted border-border resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gold hover:bg-gold-dark text-primary-foreground font-semibold"
        >
          {isSubmitting ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
        </Button>
        {editingReview && onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
