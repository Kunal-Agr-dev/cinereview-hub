import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReviewFormProps {
  movieId: string;
  movieTitle: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ movieId, movieTitle, onReviewSubmitted }: ReviewFormProps) {
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, get or create user
      let userId: string;
      
      const { data: existingUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("username", username.trim())
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.user_id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({ 
            username: username.trim(), 
            email: `${username.trim().toLowerCase().replace(/\s/g, '')}@moviereviews.app` 
          })
          .select("user_id")
          .single();

        if (userError) throw userError;
        userId = newUser.user_id;
      }

      // Submit review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          movie_id: movieId,
          user_id: userId,
          rating,
          comment: comment.trim(),
        });

      if (reviewError) throw reviewError;

      toast.success("Review submitted successfully!");
      setUsername("");
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-xl">
      <div>
        <h3 className="font-display text-2xl golden-text mb-1">Write a Review</h3>
        <p className="text-muted-foreground text-sm">for {movieTitle}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Your Name</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="bg-muted border-border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          rows={4}
          className="bg-muted border-border resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold-dark text-primary-foreground font-semibold"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
