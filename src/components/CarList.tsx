import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CarCard } from "./CarCard";

export function CarList() {
  const cars = useQuery(api.cars.list, {}) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car._id} car={car} />
      ))}
    </div>
  );
}
