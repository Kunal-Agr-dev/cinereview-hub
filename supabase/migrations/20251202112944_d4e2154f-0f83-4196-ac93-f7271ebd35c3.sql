-- Create Users Table (public profiles)
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Movies Table
CREATE TABLE public.movies (
    movie_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50),
    release_year INT,
    poster_url TEXT
);

-- Create Reviews Table
CREATE TABLE public.reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES public.movies(movie_id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Public insert policies (for demo purposes - anyone can add)
CREATE POLICY "Anyone can create users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create movies" ON public.movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Insert sample movies
INSERT INTO public.movies (title, genre, release_year, poster_url) VALUES
('The Shawshank Redemption', 'Drama', 1994, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'),
('Inception', 'Sci-Fi', 2010, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'),
('The Dark Knight', 'Action', 2008, 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400'),
('Pulp Fiction', 'Crime', 1994, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400');

-- Insert a sample user
INSERT INTO public.users (username, email) VALUES ('MovieFan', 'fan@movies.com');