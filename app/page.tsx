"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setAlreadyLoggedIn(true);
        fetchBookmarks(data.user.id);

        const shown = sessionStorage.getItem("loginSuccessShown");
        if (!shown) {
          alert("Signed in successfully");
          sessionStorage.setItem("loginSuccessShown", "true");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, DELETE, UPDATE
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const addBookmark = async () => {
    if (!title || !url) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");
    fetchBookmarks(user.id);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks(user.id);
  };

  const signInWithGoogle = async () => {
    if (alreadyLoggedIn) {
      alert("You are already signed in");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  // ---------- SIGN IN UI ----------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-3xl font-extrabold text-black mb-6">
            Smart Bookmarks
          </h1>

          <button
            onClick={signInWithGoogle}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ---------- BOOKMARKS UI ----------
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-extrabold text-black mb-4">
          Add a Bookmark
        </h2>

        <div className="space-y-3">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3
             text-gray-900 font-normal
             placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Bookmark title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3
             text-gray-900 font-normal
             placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={addBookmark}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Add Bookmark
          </button>
        </div>

        <hr className="my-6" />

        <h2 className="text-xl font-extrabold text-black mb-4">
          Your Bookmarks
        </h2>

        {bookmarks.length === 0 && (
          <p className="text-gray-500">
            No bookmarks yet.
          </p>
        )}

        <ul className="space-y-3">
          {bookmarks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center justify-between w-full">
                <a
                  href={b.url}
                  target="_blank"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {b.title}
                </a>

                <div className="flex items-center gap-4">
                  <div className="h-5 w-px bg-gray-300" />

                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}