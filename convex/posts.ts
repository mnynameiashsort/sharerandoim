import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    imageId: v.id("_storage"),
    caption: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("posts", {
      userId,
      imageId: args.imageId,
      caption: args.caption,
      tags: args.tags,
      likes: [],
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .collect();

    return await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        
        // Get comments for this post
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .collect();
        
        // Get user info for each comment
        const commentsWithUsers = await Promise.all(
          comments.map(async (comment) => {
            const commentUser = await ctx.db.get(comment.userId);
            return {
              ...comment,
              username: commentUser?.name ?? "Anonymous",
            };
          })
        );

        return {
          ...post,
          username: user?.name ?? "Anonymous",
          imageUrl: imageUrl ?? "",
          comments: commentsWithUsers,
          likes: post.likes ?? [],
          tags: post.tags ?? [],
          userId: post.userId, // Explicitly include userId
        };
      })
    );
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const likes = post.likes ?? [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await ctx.db.patch(args.postId, {
        likes: likes.filter((id) => id !== userId),
      });
    } else {
      await ctx.db.patch(args.postId, {
        likes: [...likes, userId],
      });
    }
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    return await ctx.db.insert("comments", {
      postId: args.postId,
      userId,
      text: args.text,
    });
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // Check if the user is the owner of the post
    if (post.userId.toString() !== userId.toString()) {
      throw new Error("You don't have permission to delete this post");
    }

    // Delete all comments associated with this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete the image from storage
    await ctx.storage.delete(post.imageId);

    // Delete the post
    await ctx.db.delete(args.postId);

    return { success: true };
  },
});
