import { Film } from "lucide-react";

interface Movie {
  movie_id: string;
  title: string;
  genre: string | null;
  release_year: number | null;
  poster_url: string | null;
}

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  isSelected: boolean;
}

export function MovieCard({ movie, onClick, isSelected }: MovieCardProps) {
  return (
    <button
      onClick={onClick}
      className={`movie-card w-full text-left ${isSelected ? "ring-2 ring-gold" : ""}`}
    >
      <div className="aspect-[2/3] relative bg-muted overflow-hidden">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl text-foreground leading-tight">{movie.title}</h3>
          <div className="flex gap-2 mt-1">
            {movie.genre && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                {movie.genre}
              </span>
            )}
            {movie.release_year && (
              <span className="text-xs text-muted-foreground">{movie.release_year}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
