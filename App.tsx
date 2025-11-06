
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { VehicleManagement } from './components/VehicleManagement';
import { MaintenanceManagement } from './components/MaintenanceManagement';
import { Header } from './components/Header';
import { TruckIcon, WrenchScrewdriverIcon, ChartBarIcon } from './components/Icons';

type View = 'dashboard' | 'vehicles' | 'maintenance';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon /> },
    { id: 'vehicles', label: 'Vehículos', icon: <TruckIcon /> },
    { id: 'maintenance', label: 'Mantenimiento', icon: <WrenchScrewdriverIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-900/30 md:border-r md:border-gray-700 p-4">
          <nav className="flex md:flex-col gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
