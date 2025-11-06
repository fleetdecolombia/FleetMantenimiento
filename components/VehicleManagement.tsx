import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Vehicle } from '../types';
import { Modal, ConfirmationModal } from './Modal';
import { VehicleHistoryModal } from './VehicleHistoryModal';
import { DataImportModal } from './DataImportModal';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, ArrowUpTrayIcon, EyeIcon, EyeSlashIcon } from './Icons';

export const VehicleManagement: React.FC = () => {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle, toggleVehicleStatus, bulkDeleteVehicles } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());

    const filteredVehicles = useMemo(() => vehicles.filter(v => showInactive || v.isActive), [vehicles, showInactive]);

    const handleSelectOne = (vehicleId: string) => {
        setSelectedVehicleIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(vehicleId)) {
                newSet.delete(vehicleId);
            } else {
                newSet.add(vehicleId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedVehicleIds(new Set(filteredVehicles.map(v => v.id)));
        } else {
            setSelectedVehicleIds(new Set());
        }
    };

    const openModal = (vehicle: Vehicle | null = null) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedVehicle(null);
        setIsModalOpen(false);
    };

    const openConfirmModal = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setVehicleToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const openHistoryModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsHistoryModalOpen(true);
    };

    const closeHistoryModal = () => {
        setSelectedVehicle(null);
        setIsHistoryModalOpen(false);
    };

    const handleSave = (vehicleData: Omit<Vehicle, 'id' | 'isActive'> | Vehicle) => {
        if ('id' in vehicleData) {
            updateVehicle(vehicleData);
        } else {
            addVehicle(vehicleData as Omit<Vehicle, 'id' | 'isActive'>);
        }
        closeModal();
    };

    const handleDelete = () => {
        if (vehicleToDelete) {
            deleteVehicle(vehicleToDelete.id);
            closeConfirmModal();
        }
    };
    
    const handleBulkDelete = () => {
        bulkDeleteVehicles(Array.from(selectedVehicleIds));
        setSelectedVehicleIds(new Set());
        closeConfirmModal(); 
    }

    const openBulkDeleteConfirm = () => {
        setVehicleToDelete(null); // Ensure single delete is not triggered
        setIsConfirmModalOpen(true);
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-semibold text-white">Gestión de Vehículos</h2>
                <div className="flex items-center gap-2">
                    {selectedVehicleIds.size > 0 && (
                        <button
                            onClick={openBulkDeleteConfirm}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <TrashIcon />
                            Eliminar ({selectedVehicleIds.size})
                        </button>
                    )}
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5"/>
                        Importar Datos
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        <PlusIcon />
                        Añadir Vehículo
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="flex items-center text-gray-400">
                    <input type="checkbox" checked={showInactive} onChange={() => setShowInactive(!showInactive)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-primary-600 focus:ring-primary-500 rounded" />
                    <span className="ml-2">Mostrar vehículos inactivos</span>
                </label>
            </div>

            <div className="bg-gray-800/50 shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left">
                               <input type="checkbox" 
                                 className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 text-primary-600 focus:ring-primary-500 rounded"
                                 checked={filteredVehicles.length > 0 && selectedVehicleIds.size === filteredVehicles.length}
                                 onChange={handleSelectAll}
                                 indeterminate={selectedVehicleIds.size > 0 && selectedVehicleIds.size < filteredVehicles.length}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Placa</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Marca/Modelo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kilometraje</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredVehicles.map(vehicle => (
                            <tr key={vehicle.id} className={`hover:bg-gray-700/40 ${!vehicle.isActive ? 'opacity-50' : ''} ${selectedVehicleIds.has(vehicle.id) ? 'bg-primary-900/50' : ''}`}>
                                <td className="px-6 py-4">
                                     <input type="checkbox" 
                                        className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 text-primary-600 focus:ring-primary-500 rounded"
                                        checked={selectedVehicleIds.has(vehicle.id)}
                                        onChange={() => handleSelectOne(vehicle.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vehicle.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.make} {vehicle.model}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vehicle.mileage.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                                        {vehicle.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => toggleVehicleStatus(vehicle.id)} className="text-gray-400 hover:text-white" title={vehicle.isActive ? 'Inactivar' : 'Activar'}>
                                            {vehicle.isActive ? <EyeSlashIcon /> : <EyeIcon />}
                                        </button>
                                        <button onClick={() => openHistoryModal(vehicle)} className="text-blue-400 hover:text-blue-300" title="Ver Historial"><DocumentTextIcon /></button>
                                        <button onClick={() => openModal(vehicle)} className="text-yellow-400 hover:text-yellow-300" title="Editar"><PencilIcon /></button>
                                        <button onClick={() => openConfirmModal(vehicle)} className="text-red-400 hover:text-red-300" title="Eliminar"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <VehicleFormModal vehicle={selectedVehicle} onSave={handleSave} onClose={closeModal} />}
            {isConfirmModalOpen && (
                <ConfirmationModal
                    title={vehicleToDelete ? "Eliminar Vehículo" : "Eliminar Vehículos Seleccionados"}
                    message={
                        vehicleToDelete 
                        ? `¿Estás seguro de que quieres eliminar "${vehicleToDelete.name}"? Esta acción no se puede deshacer.`
                        : `¿Estás seguro de que quieres eliminar ${selectedVehicleIds.size} vehículos seleccionados? Esta acción no se puede deshacer.`
                    }
                    onConfirm={vehicleToDelete ? handleDelete : handleBulkDelete}
                    onCancel={closeConfirmModal}
                />
            )}
            {isHistoryModalOpen && <VehicleHistoryModal vehicle={selectedVehicle} onClose={closeHistoryModal} />}
            {isImportModalOpen && <DataImportModal onClose={() => setIsImportModalOpen(false)} />}
        </div>
    );
};

interface VehicleFormModalProps {
    vehicle: Vehicle | null;
    onSave: (vehicleData: Omit<Vehicle, 'id' | 'isActive'> | Vehicle) => void;
    onClose: () => void;
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ vehicle, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: vehicle?.name || '',
        make: vehicle?.make || '',
        model: vehicle?.model || '',
        year: vehicle?.year || new Date().getFullYear(),
        mileage: vehicle?.mileage || 0,
        dailyOperationCost: vehicle?.dailyOperationCost || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = vehicle ? { ...formData, id: vehicle.id, isActive: vehicle.isActive } : formData;
        onSave(dataToSave);
    };

    return (
        <Modal title={vehicle ? 'Editar Vehículo' : 'Añadir Vehículo'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Placa" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="Marca" name="make" value={formData.make} onChange={handleChange} required />
                    <InputField label="Modelo" name="model" value={formData.model} onChange={handleChange} required />
                    <InputField label="Año" name="year" type="number" value={formData.year} onChange={handleChange} required />
                    <InputField label="Kilometraje" name="mileage" type="number" value={formData.mileage} onChange={handleChange} required />
                    <InputField label="Costo Operación Diario ($)" name="dailyOperationCost" type="number" value={formData.dailyOperationCost} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold transition-colors">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={props.name}
            {...props}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500 transition"
        />
    </div>
);