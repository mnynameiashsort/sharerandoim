import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

export function CarCard({ car }: { car: Doc<"cars"> }) {
  const like = useMutation(api.social.like);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-video relative">
        {car.images[0] && (
          <img
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          {car.make} {car.model} ({car.year})
        </h3>
        <p className="text-gray-600">${car.price}/day</p>
        <p className="mt-2 text-sm text-gray-500">{car.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="text-blue-500 hover:text-blue-600">
            Like
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Rent Now
          </button>
        </div>
      </div>
    </div>
  );
}
