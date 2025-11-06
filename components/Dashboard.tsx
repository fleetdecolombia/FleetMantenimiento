import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TruckIcon, WrenchScrewdriverIcon, ChartBarIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { vehicles, logs, serviceOrders, calculateOEEForVehicle } = useAppContext();
  const activeVehicles = vehicles.filter(v => v.isActive);

  const totalCost = logs.reduce((acc, log) => acc + log.totalCost, 0);
  const openServiceOrders = serviceOrders.filter(so => so.status !== 'Cerrada').length;
  
  const oeeData = activeVehicles.map(v => ({
      name: v.name,
      oee: calculateOEEForVehicle(v.id, 90), // OEE over last 90 days
  }));

  const averageOEE = oeeData.length > 0 ? oeeData.reduce((acc, v) => acc + v.oee, 0) / oeeData.length : 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-6">Panel General</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vehículos Activos" value={activeVehicles.length} icon={<TruckIcon />} />
        <StatCard title="Órdenes Abiertas" value={openServiceOrders} icon={<WrenchScrewdriverIcon />} />
        <StatCard title="Costo Total (Histórico)" value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<WrenchScrewdriverIcon />} />
        <StatCard title="OEE Promedio Flota (90d)" value={`${averageOEE.toFixed(1)}%`} icon={<ChartBarIcon />} />
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Rendimiento OEE por Vehículo (90 días)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={oeeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                    <Legend />
                    <Bar dataKey="oee" name="Disponibilidad OEE" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente (Últimas Órdenes Creadas)</h3>
            <ul className="divide-y divide-gray-700">
            {[...serviceOrders].reverse().slice(0, 5).map(order => {
                const vehicle = vehicles.find(v => v.id === order.vehicleId);
                return (
                <li key={order.id} className="py-3">
                    <p className="text-sm text-gray-300">
                    <span className={`font-bold ${order.type === 'Preventivo' ? 'text-blue-400' : 'text-orange-400'}`}>{order.type}</span> para <span className="font-semibold text-white">{vehicle?.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({order.id})</span>
                    </p>
                    <p className="text-xs text-gray-500">Creada: {new Date(order.creationDate).toLocaleDateString()} - Estado: {order.status}</p>
                </li>
                )
            })}
            </ul>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="bg-primary-600/20 p-3 rounded-full text-primary-400">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}
