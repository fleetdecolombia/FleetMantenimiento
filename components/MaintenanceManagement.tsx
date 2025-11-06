
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ServiceOrder, MaintenanceRoutine, MaintenancePart, ServiceOrderStatus } from '../types';
import { Modal, ConfirmationModal } from './Modal';
import { RoutineFormModal } from './RoutineFormModal';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

export const MaintenanceManagement: React.FC = () => {
    const { serviceOrders, routines, vehicles, deleteRoutine, addServiceOrder, closeServiceOrder, updateServiceOrderStatus } = useAppContext();
    
    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isCloseOrderModalOpen, setIsCloseOrderModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [selectedRoutine, setSelectedRoutine] = useState<MaintenanceRoutine | null>(null);
    const [selectedOrderToClose, setSelectedOrderToClose] = useState<ServiceOrder | null>(null);
    const [routineToDelete, setRoutineToDelete] = useState<MaintenanceRoutine | null>(null);
    
    const [filter, setFilter] = useState<'all' | ServiceOrderStatus>('all');

    const filteredOrders = useMemo(() => {
        if (filter === 'all') return serviceOrders;
        return serviceOrders.filter(o => o.status === filter);
    }, [serviceOrders, filter]);

    const openRoutineModal = (routine: MaintenanceRoutine | null = null) => {
        setSelectedRoutine(routine);
        setIsRoutineModalOpen(true);
    };

    const openConfirmModal = (routine: MaintenanceRoutine) => {
        setRoutineToDelete(routine);
        setIsConfirmModalOpen(true);
    };

    const handleDeleteRoutine = () => {
        if (routineToDelete) {
            deleteRoutine(routineToDelete.id);
            setIsConfirmModalOpen(false);
            setRoutineToDelete(null);
        }
    };
    
    const sortedOrders = useMemo(() => [...filteredOrders].sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()), [filteredOrders]);
    const sortedRoutines = useMemo(() => [...routines].sort((a,b) => a.name.localeCompare(b.name)), [routines]);

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const calculateOrderTotal = (order: ServiceOrder) => {
        const partsTotal = order.parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
        return partsTotal + order.laborCost;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-semibold text-white">Órdenes de Servicio</h2>
                    <button onClick={() => setIsOrderModalOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusIcon /> Nueva Orden
                    </button>
                </div>

                <div className="mb-4 flex gap-2 flex-wrap">
                    {(['all', 'Abierta', 'En Progreso', 'Cerrada'] as const).map(status => (
                        <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === status ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {status === 'all' ? 'Todas' : status}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-800/50 shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Costo Est.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Salida Prevista</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {sortedOrders.map(order => {
                                    const vehicle = vehicles.find(v => v.id === order.vehicleId);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-700/40">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vehicle?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={order.description}>{order.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${calculateOrderTotal(order).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDateTime(order.plannedExitDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Abierta' ? 'bg-blue-900 text-blue-200' : order.status === 'En Progreso' ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {order.status === 'Abierta' && <button onClick={() => updateServiceOrderStatus(order.id, 'En Progreso')} className="text-yellow-400 hover:text-yellow-300 mr-2 font-semibold">Iniciar</button>}
                                                {order.status === 'En Progreso' && <button onClick={() => {setSelectedOrderToClose(order); setIsCloseOrderModalOpen(true);}} className="text-green-400 hover:text-green-300 font-semibold">Cerrar</button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-semibold text-white">Rutinas</h2>
                     <button onClick={() => openRoutineModal()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <PlusIcon /> Nueva Rutina
                    </button>
                </div>
                <div className="bg-gray-800/50 shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-700">
                        {sortedRoutines.map(routine => (
                            <li key={routine.id} className="p-4 hover:bg-gray-700/40 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{routine.name}</p>
                                    <p className="text-sm text-gray-400">Cada {routine.frequencyMileage.toLocaleString()} km</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openRoutineModal(routine)} className="text-yellow-400 hover:text-yellow-300 p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Editar"><PencilIcon className="h-4 w-4" /></button>
                                    <button onClick={() => openConfirmModal(routine)} className="text-red-400 hover:text-red-300 p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Eliminar"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {isRoutineModalOpen && <RoutineFormModal routine={selectedRoutine} onClose={() => setIsRoutineModalOpen(false)} />}
            {isConfirmModalOpen && (
                <ConfirmationModal 
                    title="Eliminar Rutina"
                    message={`¿Estás seguro de que quieres eliminar la rutina "${routineToDelete?.name}"?`}
                    onConfirm={handleDeleteRoutine}
                    onCancel={() => setIsConfirmModalOpen(false)}
                />
            )}
            {isOrderModalOpen && <ServiceOrderFormModal onClose={() => setIsOrderModalOpen(false)} onSave={addServiceOrder} />}
            {isCloseOrderModalOpen && selectedOrderToClose && <CloseServiceOrderModal order={selectedOrderToClose} onClose={() => setIsCloseOrderModalOpen(false)} onSave={closeServiceOrder} />}

        </div>
    );
};

// --- Modals for Service Orders ---

interface ServiceOrderFormModalProps {
    onClose: () => void;
    onSave: (data: Omit<ServiceOrder, 'id'|'status'>) => void;
}

const ServiceOrderFormModal: React.FC<ServiceOrderFormModalProps> = ({ onClose, onSave }) => {
    const { vehicles, routines } = useAppContext();
    const [vehicleId, setVehicleId] = useState('');
    const [type, setType] = useState<'Preventivo' | 'Correctivo'>('Correctivo');
    const [description, setDescription] = useState('');
    const [routineId, setRoutineId] = useState('');
    const [creationDate, setCreationDate] = useState(new Date().toISOString().slice(0, 16));
    const [plannedExitDate, setPlannedExitDate] = useState(new Date().toISOString().slice(0, 16));
    const [parts, setParts] = useState<MaintenancePart[]>([]);
    const [laborHours, setLaborHours] = useState(0);
    const [laborCost, setLaborCost] = useState(0);

    const estimatedTotal = useMemo(() => {
        const partsTotal = parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
        return partsTotal + laborCost;
    }, [parts, laborCost]);

    useEffect(() => {
        if (type === 'Preventivo' && routineId) {
            const routine = routines.find(r => r.id === routineId);
            if (routine) {
                setDescription(routine.name);
                setParts(JSON.parse(JSON.stringify(routine.parts))); // Deep copy
                setLaborHours(routine.laborHours);
                setLaborCost(routine.laborCost);
            }
        } else {
            setDescription('');
            setParts([]);
            setLaborHours(0);
            setLaborCost(0);
        }
    }, [type, routineId, routines]);

    const handlePartChange = (index: number, field: keyof MaintenancePart, value: string | number) => {
        const newParts = [...parts];
        if ((field === 'cost' || field === 'quantity') && typeof value === 'string') {
            newParts[index][field] = parseFloat(value) || 0;
        } else {
            (newParts[index] as any)[field] = value;
        }
        setParts(newParts);
    };

    const addPart = () => setParts([...parts, { name: '', cost: 0, quantity: 1 }]);
    const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicleId || !description) return;
        
        onSave({ 
            vehicleId, type, description, parts, laborHours, laborCost,
            creationDate: new Date(creationDate).toISOString(),
            plannedExitDate: new Date(plannedExitDate).toISOString(),
        });
        onClose();
    };

    return (
        <Modal title="Nueva Orden de Servicio" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <SelectField label="Vehículo" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                    <option value="">Seleccionar vehículo</option>
                    {vehicles.filter(v => v.isActive).map(v => <option key={v.id} value={v.id}>{v.name} - {v.make} {v.model}</option>)}
                </SelectField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Fecha y Hora de Ingreso" type="datetime-local" value={creationDate} onChange={e => setCreationDate(e.target.value)} required />
                    <InputField label="Fecha y Hora de Salida Prevista" type="datetime-local" value={plannedExitDate} onChange={e => setPlannedExitDate(e.target.value)} required />
                </div>
                
                <SelectField label="Tipo de Mantenimiento" value={type} onChange={e => { setType(e.target.value as any); setRoutineId(''); }}>
                    <option value="Correctivo">Correctivo</option>
                    <option value="Preventivo">Preventivo</option>
                </SelectField>

                {type === 'Preventivo' ? (
                    <SelectField label="Rutina" value={routineId} onChange={e => setRoutineId(e.target.value)} required>
                         <option value="">Seleccionar rutina</option>
                        {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </SelectField>
                ) : (
                    <InputField label="Descripción del Servicio/Problema" name="description" value={description} onChange={e => setDescription(e.target.value)} required />
                )}

                <div className="pt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Horas Mano de Obra" type="number" value={laborHours} onChange={e => setLaborHours(parseFloat(e.target.value))} />
                        <InputField label="Costo Mano de Obra ($)" type="number" value={laborCost} onChange={e => setLaborCost(parseFloat(e.target.value))} />
                    </div>

                    <div>
                        <h4 className="text-md font-medium text-gray-200 mb-2">Repuestos</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                             {parts.map((part, index) => (
                                <div key={index} className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-center">
                                    <input type="text" placeholder="Nombre" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                    <input type="number" placeholder="Cant." value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                    <input type="number" placeholder="Costo" value={part.cost} onChange={(e) => handlePartChange(index, 'cost', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                    <button type="button" onClick={() => removePart(index)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addPart} className="mt-2 flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-semibold"><PlusIcon className="h-4 w-4" /> Añadir Repuesto</button>
                    </div>
                </div>
                 <div className="text-right font-bold text-lg text-white pt-2">
                    Total Estimado: ${estimatedTotal.toFixed(2)}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold transition-colors">Crear Orden</button>
                </div>
            </form>
        </Modal>
    );
};

interface CloseServiceOrderModalProps {
    order: ServiceOrder;
    onClose: () => void;
    onSave: (orderId: string, logData: any) => void;
}

const CloseServiceOrderModal: React.FC<CloseServiceOrderModalProps> = ({ order, onClose, onSave }) => {
    const { getVehicleById } = useAppContext();
    const vehicle = getVehicleById(order.vehicleId);

    const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
    const [mileage, setMileage] = useState(vehicle?.mileage || 0);
    const [laborCost, setLaborCost] = useState(order.laborCost);
    const [parts, setParts] = useState<MaintenancePart[]>(JSON.parse(JSON.stringify(order.parts))); // Deep copy

    const handlePartChange = (index: number, field: keyof MaintenancePart, value: string | number) => {
        const newParts = [...parts];
        if ((field === 'cost' || field === 'quantity') && typeof value === 'string') {
            newParts[index][field] = parseFloat(value) || 0;
        } else {
            (newParts[index] as any)[field] = value;
        }
        setParts(newParts);
    };
    const addPart = () => setParts([...parts, { name: '', cost: 0, quantity: 1 }]);
    const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(order.id, { completionDate, mileage, laborCost, parts });
        onClose();
    };

    return (
        <Modal title={`Cerrar Orden para ${vehicle?.name}`} onClose={onClose}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Fecha de Cierre" type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} required />
                    <InputField label="Kilometraje Actual" type="number" value={mileage} onChange={e => setMileage(parseFloat(e.target.value))} required />
                </div>
                <InputField label="Costo Final Mano de Obra ($)" type="number" value={laborCost} onChange={e => setLaborCost(parseFloat(e.target.value))} required />
                
                <div>
                    <h4 className="text-md font-medium text-gray-200 mb-2">Repuestos Utilizados (Final)</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {parts.map((part, index) => (
                             <div key={index} className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-center">
                                <input type="text" placeholder="Nombre" value={part.name} onChange={(e) => handlePartChange(index, 'name', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                <input type="number" placeholder="Cant." value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                <input type="number" placeholder="Costo" value={part.cost} onChange={(e) => handlePartChange(index, 'cost', e.target.value)} className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm w-full" required />
                                <button type="button" onClick={() => removePart(index)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addPart} className="mt-2 flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-semibold"><PlusIcon className="h-4 w-4" /> Añadir Repuesto</button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold transition-colors">Guardar y Cerrar</button>
                </div>
             </form>
        </Modal>
    )
}


// --- Form Field Components ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input id={props.name} {...props} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500 transition" />
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, children, ...props }) => (
     <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select id={props.name} {...props} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500 transition">
            {children}
        </select>
    </div>
)
