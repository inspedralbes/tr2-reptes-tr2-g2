import React from "react";

type WorkshopActionsProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilterPress: () => void;
  onCreatePress: () => void;
};

const WorkshopActions = ({
  searchQuery,
  setSearchQuery,
  onFilterPress,
  onCreatePress,
}: WorkshopActionsProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-4">
        <div className="flex-1 flex items-center p-2 border border-gray-300 rounded">
          <span className="text-blue-400 mr-2">🔍</span>
          <input
            className="flex-1 outline-none"
            placeholder="Buscar talleres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <button
          className="flex items-center bg-blue-600 p-2 rounded text-white font-bold hover:bg-blue-700"
          onClick={onFilterPress}
        >
          <span className="mr-2">🔧</span>
          Filtrar
        </button>
        <button
          className="flex items-center bg-blue-600 p-2 rounded text-white font-bold hover:bg-blue-700"
          onClick={onCreatePress}
        >
          <span className="mr-2">➕</span>
          Crear Taller
        </button>
      </div>
    </div>
  );
};

export default WorkshopActions;