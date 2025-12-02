import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Movie {
  movie_id: string;
  title: string;
  genre: string | null;
  release_year: number | null;
  poster_url: string | null;
}

interface MovieFormProps {
  movie?: Movie | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function MovieForm({ movie, onSuccess, onCancel }: MovieFormProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setGenre(movie.genre || "");
      setReleaseYear(movie.release_year?.toString() || "");
      setPosterUrl(movie.poster_url || "");
    }
  }, [movie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const year = releaseYear ? parseInt(releaseYear) : null;
    if (releaseYear && (isNaN(year!) || year! < 1800 || year! > 2100)) {
      toast.error("Please enter a valid year");
      return;
    }

    setIsSubmitting(true);

    try {
      const movieData = {
        title: title.trim(),
        genre: genre.trim() || null,
        release_year: year,
        poster_url: posterUrl.trim() || null,
      };

      if (movie) {
        const { error } = await supabase
          .from("movies")
          .update(movieData)
          .eq("movie_id", movie.movie_id);
        if (error) throw error;
        toast.success("Movie updated!");
      } else {
        const { error } = await supabase.from("movies").insert(movieData);
        if (error) throw error;
        toast.success("Movie added!");
      }

      setTitle("");
      setGenre("");
      setReleaseYear("");
      setPosterUrl("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save movie");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-xl">
      <h3 className="font-display text-2xl golden-text">
        {movie ? "Edit Movie" : "Add New Movie"}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Movie title"
          className="bg-muted border-border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Genre
        </label>
        <Input
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="e.g. Sci-Fi, Drama, Comedy"
          className="bg-muted border-border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Release Year
        </label>
        <Input
          type="number"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
          placeholder="e.g. 2024"
          min={1800}
          max={2100}
          className="bg-muted border-border"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Poster URL
        </label>
        <Input
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          placeholder="https://example.com/poster.jpg"
          className="bg-muted border-border"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gold hover:bg-gold-dark text-primary-foreground font-semibold"
        >
          {isSubmitting ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
