
import React from 'react';
import { TruckIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <TruckIcon className="h-8 w-8 text-primary-400" />
            <h1 className="text-xl md:text-2xl font-bold text-white">
                Fleet Maintenance Pro
            </h1>
        </div>
        <div className="text-sm text-gray-400">
            Panel de Operaciones
        </div>
      </div>
    </header>
  );
};
