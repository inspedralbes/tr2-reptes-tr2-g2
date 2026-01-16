import React from 'react';
import { Taller } from '../services/tallerService';

interface WorkshopCardProps {
  item: Taller;
  onPress: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ item, onPress }) => {
  const imageSource = (item as any).imatge 
    ? (item as any).imatge 
    : "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop";

  return (
    <button
      onClick={onPress}
      className="mb-6 border border-gray-300 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg"
    >
      <div className="h-48 w-full bg-gray-200 relative">
        <img 
          src={imageSource}
          className="w-full h-full object-cover"
          alt={item.titol}
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded">
          <span className="text-blue-600 text-xs font-bold uppercase">
            {item.modalitat}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-blue-600 font-bold text-xl flex-1 mr-2 leading-6">
            {item.titol}
          </span>
        </div>

        <span className="text-gray-600 text-sm leading-5 mb-4">
          {item.detalls_tecnics?.descripcio || "Sense descripció disponible."}
        </span>

        <div className="flex items-center justify-between pt-3 border-t border-gray-300">
          <div className="flex items-center">
            <span className="text-blue-400 text-xs mr-1">👥</span>
            <span className="text-gray-600 text-xs font-medium">
              {item.detalls_tecnics?.places_maximes ?? "-"} plazas
            </span>
          </div>

          <div className="bg-blue-600 px-4 py-2 rounded">
            <span className="text-white text-xs font-bold">Ver Taller</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default WorkshopCard;