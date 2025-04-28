import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImagePost } from "./ImagePost";
import { useState, useEffect } from "react";

export function PostList() {
  const posts = useQuery(api.posts.list);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate a minimum loading time for better UX
  useEffect(() => {
    if (posts !== undefined) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [posts]);

  if (!posts || isLoading) {
    return (
      <div className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Be the first to share a moment with the community! Click the "New Post" button to get started.  
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5">
              Create Your First Post
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <div key={post._id} className="transform transition-all duration-300 hover:-translate-y-1">
              <ImagePost post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
