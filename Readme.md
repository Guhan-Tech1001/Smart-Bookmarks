# Smart Bookmark App

-- A simple bookmark manager built with Next.js, Supabase, and Tailwind CSS. Users can sign in using Google, add bookmarks, and see updates in real-time.

# Features

- Sign up / Log in with Google OAuth (no email/password)

- Add bookmarks (URL + title)

- Bookmarks are private per user

- Real-time updates across multiple tabs

- Delete bookmarks

- Deployed on Vercel with a working live URL

# Tech Stack

- Frontend: Next.js (App Router) and Tailwind CSS

- Backend & Database: Supabase (Auth, Database, Realtime)

- Deployment: Vercel

# Problems Faced and Solutions

* Google OAuth Setup
    Problem: Initially had trouble configuring Supabase Google OAuth correctly; redirect URL errors occurred.
    Solution: Ensured the redirect URL in Supabase matched the Vercel deployment URL and added http://localhost:3000 for local testing.

* Realtime Updates
    Problem: Bookmarks weren’t appearing in other tabs immediately after adding.
    Solution: Used Supabase Realtime subscription on the bookmarks table, filtering by the current user's ID to update the list instantly across tabs.

* User-Specific Data
    Problem: Initially, bookmarks were visible to all users.
    Solution: Added a user_id column in the database and filtered queries by user_id = auth.user.id to make bookmarks private.

* Deployment Issues
    Problem: Supabase environment variables weren’t working on Vercel, causing authentication failures.
    Solution: Properly added all Supabase keys (URL & anon key) to Vercel environment variables and restarted the deployment.

* Deleting Bookmarks
    Problem: Deleting bookmarks sometimes failed or caused UI not to refresh.
    Solution: Used Supabase delete query combined with updating local state and listening to realtime changes to ensure UI stays consistent.

Google OAuth Setup
Problem: Initially had trouble configuring Supabase Google OAuth correctly; redirect URL errors occurred.
Solution: Ensured the redirect URL in Supabase matched the Vercel deployment URL and added http://localhost:3000 for local testing.
