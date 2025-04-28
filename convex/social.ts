import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const follow = mutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) throw new Error("Not authenticated");

    return await ctx.db.insert("follows", {
      followerId,
      followingId: args.userId
    });
  }
});

export const like = mutation({
  args: {
    postId: v.id("posts")
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const likes = new Set(post.likes);
    likes.add(userId);

    await ctx.db.patch(args.postId, {
      likes: Array.from(likes)
    });
  }
});

export const comment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("comments", {
      postId: args.postId,
      userId,
      text: args.content
    });
  }
});
