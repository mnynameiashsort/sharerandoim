import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  _id: Id<"comments">;
  _creationTime: number;
  postId: Id<"posts">;
  userId: Id<"users">;
  text: string;
  username: string;
}

interface Post extends Omit<Doc<"posts">, 'likes'> {
  imageUrl: string;
  username: string;
  comments: Comment[];
  likes: Id<"users">[];
  tags: string[];
  caption: string;
}

export function ImagePost({ post }: { post: Post }) {
  const toggleLike = useMutation(api.posts.toggleLike);
  const addComment = useMutation(api.posts.addComment);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  
  // Format the post creation time
  const formattedTime = formatDistanceToNow(new Date(post._creationTime), { addSuffix: true });
  
  // Handle like animation
  const handleLike = async () => {
    setIsLikeAnimating(true);
    await toggleLike({ postId: post._id });
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment({
        postId: post._id,
        text: newComment.trim(),
      });
      setNewComment("");
      // Auto-scroll to the bottom of comments after adding a new one
      if (commentsRef.current) {
        setTimeout(() => {
          if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine how many comments to show
  const commentsToShow = showAllComments ? post.comments : post.comments?.slice(0, 3);
  const hasMoreComments = (post.comments?.length || 0) > 3;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Post header with user info */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
            {post.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{post.username}</div>
            <div className="text-xs text-gray-500">{formattedTime}</div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
      
      {/* Image container with overlay for double-click like */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden group">
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "https://placehold.co/600x600?text=Image+Not+Found";
          }}
        />
        
        {/* Heart animation overlay */}
        {isLikeAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg 
              className="w-24 h-24 text-white animate-ping opacity-70"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Post content and interactions */}
      <div className="p-5">
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-all ${post.likes?.length > 0 ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${post.likes?.length > 0 ? 'fill-current' : 'stroke-current fill-none'} transition-all ${isLikeAnimating ? 'scale-125' : ''}`} viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{post.likes?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          
          <button className="flex items-center space-x-1 text-gray-600 hover:text-yellow-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        
        {/* Caption */}
        <div className="mb-3">
          <p className="text-sm break-words leading-relaxed">
            <span className="font-semibold mr-2">{post.username}</span>
            {post.caption}
          </p>
        </div>
        
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-4 flex gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Comments section */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          {post.comments && post.comments.length > 0 ? (
            <>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Comments
              </h4>
              <div 
                ref={commentsRef}
                className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {commentsToShow.map((comment) => (
                  <div key={comment._id} className="flex space-x-2 group animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white text-xs">
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 group-hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{comment.username}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show more comments button */}
              {hasMoreComments && (
                <button 
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-sm text-blue-500 hover:text-blue-700 mt-2 transition-colors"
                >
                  {showAllComments ? "Show fewer comments" : `Show all ${post.comments.length} comments`}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={500}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Post"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
