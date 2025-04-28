import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

// Function to create a user after authentication
export const createUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Expected a user ID");
    }

    // Check if user already exists
    const existingUser = await ctx.db.get(userId);
    if (existingUser) {
      return existingUser;
    }

    // Handle different auth providers
    if (identity.tokenIdentifier.startsWith("password:")) {
      // Email/password user
      const email = identity.email;
      if (!email) {
        throw new Error("Expected an email");
      }

      // Create the user with the email as the name
      const user = await ctx.db.insert("users", {
        name: email.split("@")[0], // Use the part before @ as the username
        email: email,
      });

      // Initialize user profile for gamification
      await ctx.db.insert("userProfiles", {
        userId,
        points: 0,
        badges: [],
        lastCheckIn: undefined,
        consecutiveCheckIns: 0,
      });

      return user;
    } else if (identity.tokenIdentifier.startsWith("anonymous:")) {
      // Anonymous user
      const user = await ctx.db.insert("users", {
        name: `User_${Math.floor(Math.random() * 10000)}`,
      });

      // Initialize user profile for gamification
      await ctx.db.insert("userProfiles", {
        userId,
        points: 0,
        badges: [],
        lastCheckIn: undefined,
        consecutiveCheckIns: 0,
      });

      return user;
    }

    throw new Error("Unsupported authentication provider");
  },
});

// Function to update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Get the current user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user profile
    if (args.name) {
      await ctx.db.patch(userId, { name: args.name });
    }
    
    return { success: true };
  },
});
