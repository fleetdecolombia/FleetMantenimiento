import React, { useState } from 'react';
import { Modal } from './Modal';
import { MaintenanceRoutine, MaintenancePart } from '../types';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon } from './Icons';

interface RoutineFormModalProps {
    routine: MaintenanceRoutine | null;
    onClose: () => void;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({ routine, onClose }) => {
    const { addRoutine, updateRoutine } = useAppContext();
    const [formData, setFormData] = useState({
        name: routine?.name || '',
        frequencyMileage: routine?.frequencyMileage || 0,
        laborHours: routine?.laborHours || 0,
        laborCost: routine?.laborCost || 0,
    });
    const [parts, setParts] = useState<MaintenancePart[]>(routine?.parts ? JSON.parse(JSON.stringify(routine.parts)) : []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' && value ? parseFloat(value) : value }));
    };

    const handlePartChange = (index: number, field: keyof MaintenancePart, value: string | number) => {
        const newParts = [...parts];
        if ((field === 'cost' || field === 'quantity') && typeof value === 'string') {
            newParts[index][field] = parseFloat(value) || 0;
        } else {
            (newParts[index] as any)[field] = value;
        }
        setParts(newParts);
    };

    const addPart = () => {
        setParts([...parts, { name: '', cost: 0, quantity: 1 }]);
    };

    const removePart = (index: number) => {
        setParts(parts.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const routineData = { ...formData, parts };
        if (routine) {
            updateRoutine({ ...routineData, id: routine.id });
        } else {
            addRoutine(routineData);
        }
        onClose();
    };

    return (
        <Modal title={routine ? 'Editar Rutina' : 'Añadir Rutina'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Nombre de la Rutina" name="name" value={formData.name} onChange={handleFormChange} required />
                <InputField label="Frecuencia (Kilometraje)" name="frequencyMileage" type="number" value={formData.frequencyMileage} onChange={handleFormChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Horas Mano de Obra" name="laborHours" type="number" value={formData.laborHours} onChange={handleFormChange} required />
                    <InputField label="Costo Total Mano de Obra ($)" name="laborCost" type="number" value={formData.laborCost} onChange={handleFormChange} required />
                </div>
                
                <div className="pt-2">
                    <h4 className="text-md font-medium text-gray-200 mb-2">Repuestos Requeridos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {parts.map((part, index) => (
                            <div key={index} className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-center">
                                <input type="text" placeholder="Nombre" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm" required />
                                <input type="number" placeholder="Cant." value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm" required />
                                <input type="number" placeholder="Costo" value={part.cost} onChange={(e) => handlePartChange(index, 'cost', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm" required />
                                <button type="button" onClick={() => removePart(index)} className="text-red-400 hover:text-red-300 p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addPart} className="mt-2 flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-semibold">
                        <PlusIcon className="h-4 w-4" />
                        Añadir Repuesto
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold transition-colors">Guardar Rutina</button>
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