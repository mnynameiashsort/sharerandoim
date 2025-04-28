import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  posts: defineTable({
    userId: v.id("users"),
    imageId: v.id("_storage"),
    caption: v.string(),
    tags: v.array(v.string()),
    likes: v.array(v.id("users")),
  }).index("by_user", ["userId"]),
  
  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    text: v.string(),
  }).index("by_post", ["postId"]),
  
  cars: defineTable({
    ownerId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    price: v.number(),
    location: v.object({
      lat: v.number(),
      lng: v.number()
    }),
    description: v.string(),
    images: v.array(v.id("_storage")),
    category: v.string(),
    features: v.array(v.string()),
    available: v.boolean()
  }).index("by_availability", ["available"]),
  
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users")
  }),
  
  listings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    images: v.array(v.id("_storage")),
    likes: v.array(v.id("users"))
  })
};

// Gamification and social features tables
const gamificationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    points: v.number(),
    badges: v.array(v.string()),
    lastCheckIn: v.optional(v.number()),
    consecutiveCheckIns: v.number(),
  }).index("by_user", ["userId"]),
  
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    pointsReward: v.number(),
    badgeReward: v.optional(v.string()),
    requirements: v.object({
      type: v.string(), // e.g., "posts", "comments", "likes"
      count: v.number(),
    }),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isActive: v.boolean(),
  }),
  
  userChallenges: defineTable({
    userId: v.id("users"),
    challengeId: v.id("challenges"),
    progress: v.number(),
    completed: v.boolean(),
    completedDate: v.optional(v.number()),
    rewardClaimed: v.boolean(),
  }).index("by_user", ["userId"]),
  
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // e.g., "like", "comment", "challenge"
    message: v.string(),
    relatedId: v.optional(v.id("posts")), // Optional reference to related content
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  
  reactions: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    type: v.string(), // e.g., "like", "love", "laugh", "wow", "sad", "angry"
  }).index("by_post", ["postId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  ...gamificationTables,
});
