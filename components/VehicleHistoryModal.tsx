import React from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { Vehicle } from '../types';

interface VehicleHistoryModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({ vehicle, onClose }) => {
  const { logs } = useAppContext();
  
  if (!vehicle) return null;

  const vehicleLogs = logs
    .filter(log => log.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());

  return (
    <Modal title={`Historial de Mantenimiento: ${vehicle.name}`} onClose={onClose}>
      <div className="space-y-4">
        {vehicleLogs.length > 0 ? (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50 sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha Cierre</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Costo Inactividad</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Costo Total</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {vehicleLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-700/40">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{log.completionDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.type === 'Preventivo' ? 'bg-blue-900 text-blue-200' : 'bg-orange-900 text-orange-200'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">${log.downtimeCost.toFixed(2)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-semibold">${log.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No hay registros de mantenimiento para este vehículo.</p>
        )}
      </div>
    </Modal>
  );
};
