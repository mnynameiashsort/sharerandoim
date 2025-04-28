import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      radius: v.number()
    })),
    category: v.optional(v.string()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number()
    }))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let cars = await ctx.db
      .query("cars")
      .withIndex("by_availability", q => q.eq("available", true))
      .collect();

    if (args.location) {
      cars = cars.filter(car => {
        const distance = Math.sqrt(
          Math.pow(car.location.lat - args.location!.lat, 2) +
          Math.pow(car.location.lng - args.location!.lng, 2)
        );
        return distance <= args.location!.radius;
      });
    }

    if (args.category) {
      cars = cars.filter(car => car.category === args.category);
    }

    if (args.priceRange) {
      cars = cars.filter(car => 
        car.price >= args.priceRange!.min && 
        car.price <= args.priceRange!.max
      );
    }

    return cars;
  }
});

export const create = mutation({
  args: {
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
    features: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("cars", {
      ownerId: userId,
      available: true,
      ...args
    });
  }
});
