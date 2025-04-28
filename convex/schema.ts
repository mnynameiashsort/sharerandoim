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

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
