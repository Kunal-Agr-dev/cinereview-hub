import { useState, useEffect, useCallback } from "react";
import { Clapperboard, Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MovieCard } from "@/components/MovieCard";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewList } from "@/components/ReviewList";
import { MovieForm } from "@/components/MovieForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
  user_id: string | null;
  users: {
    username: string;
    email: string;
  } | null;
}

interface LatestReview extends Review {
  movies: {
    title: string;
  } | null;
}

const Index = () => {
  const { user, signOut, userProfile, isLoading: authLoading } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [latestReview, setLatestReview] = useState<LatestReview | null>(null);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

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

  const fetchLatestReview = async () => {
    const { data } = await supabase
      .from("reviews")
      .select(`
        review_id,
        rating,
        comment,
        created_at,
        user_id,
        users (username, email),
        movies (title)
      `)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLatestReview(data as LatestReview);
    }
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
        user_id,
        users (username, email)
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
    fetchLatestReview();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Delete this movie? All reviews will be deleted too.")) return;
    
    const { error } = await supabase.from("movies").delete().eq("movie_id", movieId);
    if (error) {
      toast.error("Failed to delete movie");
    } else {
      toast.success("Movie deleted");
      if (selectedMovie?.movie_id === movieId) {
        setSelectedMovie(null);
      }
      fetchMovies();
      fetchLatestReview();
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    
    const { error } = await supabase.from("reviews").delete().eq("review_id", reviewId);
    if (error) {
      toast.error("Failed to delete review");
    } else {
      toast.success("Review deleted");
      fetchReviews();
      fetchLatestReview();
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchLatestReview();
    setEditingReview(null);
  };

  return (
    <div className="min-h-screen cinema-gradient">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clapperboard className="w-8 h-8 text-gold" />
            <h1 className="font-display text-3xl golden-text">CineReviews</h1>
          </div>
          <div className="flex items-center gap-3">
            {authLoading ? null : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {userProfile?.username || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Latest Review Card */}
        {latestReview && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-foreground mb-4">Latest Review</h2>
            <div className="bg-card rounded-xl p-6 border border-gold/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl golden-text">{latestReview.movies?.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    by {latestReview.users?.username || "Anonymous"}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= latestReview.rating ? "text-gold" : "text-muted-foreground"}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-secondary-foreground">{latestReview.comment}</p>
            </div>
          </section>
        )}

        {/* Movies Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-4xl text-foreground">Featured Movies</h2>
            {user && (
              <Button
                onClick={() => { setShowMovieForm(true); setEditingMovie(null); }}
                className="bg-gold hover:bg-gold-dark text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Movie
              </Button>
            )}
          </div>

          {showMovieForm && (
            <div className="mb-6">
              <MovieForm
                movie={editingMovie}
                onSuccess={() => { setShowMovieForm(false); setEditingMovie(null); fetchMovies(); }}
                onCancel={() => { setShowMovieForm(false); setEditingMovie(null); }}
              />
            </div>
          )}
          
          {isLoadingMovies ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No movies yet. {user ? "Add the first one!" : "Sign in to add movies."}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <div key={movie.movie_id} className="relative group">
                  <MovieCard
                    movie={movie}
                    onClick={() => setSelectedMovie(movie)}
                    isSelected={selectedMovie?.movie_id === movie.movie_id}
                  />
                  {user && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); setEditingMovie(movie); setShowMovieForm(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); handleDeleteMovie(movie.movie_id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
              <ReviewList
                reviews={reviews}
                isLoading={isLoadingReviews}
                onEdit={(review) => setEditingReview(review)}
                onDelete={handleDeleteReview}
              />
            </div>
            
            <div>
              <ReviewForm
                movieId={selectedMovie.movie_id}
                movieTitle={selectedMovie.title}
                onReviewSubmitted={handleReviewSubmitted}
                editingReview={editingReview}
                onCancelEdit={() => setEditingReview(null)}
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
