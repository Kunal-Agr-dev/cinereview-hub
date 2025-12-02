# CineReviews - Movie Reviews App

A full-stack movie reviews application built with React, Vite, and Supabase (via Lovable Cloud).

## Features

- **User Authentication**: Sign up and log in with email/password
- **Movies CRUD**: Create, read, update, and delete movies
- **Reviews CRUD**: Create, read, update, and delete reviews (only your own)
- **Latest Review Display**: Homepage shows the most recent review
- **Client-side Validation**: Required fields, rating bounds (1-5)
- **Row-Level Security**: Users can only edit/delete their own reviews

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Lovable Cloud)
- **Authentication**: Supabase Auth

## Database Schema

The app uses three tables:

```sql
-- Users Table (auto-populated on signup via trigger)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Movies Table
CREATE TABLE movies (
    movie_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50),
    release_year INT,
    poster_url TEXT
);

-- Reviews Table
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES movies(movie_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Auth to User Mapping

When a user signs up via Supabase Auth, a database trigger automatically creates a corresponding row in the `users` table:
- `user_id` is set to `auth.users.id` (the Supabase Auth user ID)
- `username` is extracted from signup metadata or derived from email
- `email` is the authenticated user's email

This ensures the `users.user_id` matches `auth.users.id` for RLS policies.

## Row-Level Security (RLS)

The app enforces these security rules:
- **Movies**: Anyone can view; authenticated users can create/update/delete
- **Reviews**: Anyone can view; authenticated users can create; users can only update/delete their own reviews
- **Users**: Anyone can view; users can only create/update their own profile

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── MovieCard.tsx    # Movie display card
│   ├── MovieForm.tsx    # Create/edit movie form
│   ├── ReviewForm.tsx   # Create/edit review form
│   ├── ReviewList.tsx   # List of reviews
│   └── StarRating.tsx   # Star rating component
├── hooks/
│   └── useAuth.tsx      # Authentication context/hook
├── integrations/
│   └── supabase/        # Supabase client (auto-generated)
├── pages/
│   ├── Index.tsx        # Homepage
│   ├── Auth.tsx         # Login/signup page
│   └── NotFound.tsx     # 404 page
├── App.tsx              # Main app with routes
└── main.tsx             # Entry point
```

## Usage

1. **Sign Up**: Create an account at `/auth`
2. **Add Movies**: Click "Add Movie" to create a new movie entry
3. **Write Reviews**: Select a movie and write a review (rating 1-5 required)
4. **Edit/Delete**: Hover over movies to edit/delete them; your own reviews show edit/delete buttons

## Deployment

This project is deployed via Lovable. Click the "Publish" button in the Lovable editor to deploy.

## License

MIT
