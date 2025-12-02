import { useState, useEffect, useCallback } from "react";
import { Clapperboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "@/components/MovieCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";

interface Movie {
  movie_id: string;
  title: string;
  genre: string | null;
  release_year: number | null;
  poster_url: string | null;
}

interface Review {
  review_id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    username: string;
  } | null;
}

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("title");

    if (!error && data) {
      setMovies(data);
      if (data.length > 0 && !selectedMovie) {
        setSelectedMovie(data[0]);
      }
    }
    setIsLoadingMovies(false);
  };

  const fetchReviews = useCallback(async () => {
    if (!selectedMovie) return;
    
    setIsLoadingReviews(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        review_id,
        rating,
        comment,
        created_at,
        users (username)
      `)
      .eq("movie_id", selectedMovie.movie_id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as Review[]);
    }
    setIsLoadingReviews(false);
  }, [selectedMovie]);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="min-h-screen cinema-gradient">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-3">
          <Clapperboard className="w-8 h-8 text-gold" />
          <h1 className="font-display text-3xl golden-text">CineReviews</h1>
        </div>
      </header>

      <main className="container py-8">
        {/* Movies Section */}
        <section className="mb-10">
          <h2 className="font-display text-4xl text-foreground mb-6">Featured Movies</h2>
          
          {isLoadingMovies ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.movie_id}
                  movie={movie}
                  onClick={() => setSelectedMovie(movie)}
                  isSelected={selectedMovie?.movie_id === movie.movie_id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Reviews Section */}
        {selectedMovie && (
          <section className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-3xl text-foreground mb-4">
                Reviews for <span className="golden-text">{selectedMovie.title}</span>
              </h2>
              <ReviewList reviews={reviews} isLoading={isLoadingReviews} />
            </div>
            
            <div>
              <ReviewForm
                movieId={selectedMovie.movie_id}
                movieTitle={selectedMovie.title}
                onReviewSubmitted={fetchReviews}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container py-6 text-center text-muted-foreground text-sm">
          <p>CineReviews &copy; {new Date().getFullYear()} — Share your movie opinions</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
