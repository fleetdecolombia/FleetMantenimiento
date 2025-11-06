import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { Vehicle, MaintenanceLog, ServiceOrder, ServiceOrderStatus, MaintenanceRoutine, MaintenancePart } from '../types';
import { v4 as uuidv4 } from 'uuid';

// INITIAL DUMMY DATA
const initialVehicles: Vehicle[] = [
  { id: 'v1', name: 'TRK-001', make: 'Freightliner', model: 'Cascadia', year: 2021, mileage: 150000, dailyOperationCost: 300, isActive: true },
  { id: 'v2', name: 'TRK-002', make: 'Volvo', model: 'VNL 860', year: 2020, mileage: 220000, dailyOperationCost: 320, isActive: true },
  { id: 'v3', name: 'TRK-003', make: 'Kenworth', model: 'T680', year: 2019, mileage: 310000, dailyOperationCost: 350, isActive: false },
];

const initialRoutines: MaintenanceRoutine[] = [
    { id: 'r1', name: 'Cambio de Aceite (Motor)', frequencyMileage: 25000, laborHours: 3, laborCost: 150, parts: [{name: 'Filtro de Aceite', cost: 40, quantity: 1}, {name: 'Aceite Sintético (Galón)', cost: 25, quantity: 10}] },
    { id: 'r2', name: 'Inspección de Frenos', frequencyMileage: 50000, laborHours: 4, laborCost: 200, parts: [] },
];

const initialServiceOrders: ServiceOrder[] = [
    { id: 'so2', vehicleId: 'v2', creationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), plannedExitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'Correctivo', status: 'En Progreso', description: 'Fallo en sistema de inyección', parts: [], laborHours: 8, laborCost: 500 },
    { id: 'so3', vehicleId: 'v2', creationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), plannedExitDate: new Date().toISOString(), type: 'Preventivo', status: 'Abierta', description: 'Inspección de frenos programada', parts: [], laborHours: 4, laborCost: 200 },
];

const initialLogs: MaintenanceLog[] = [
    { id: 'log1', serviceOrderId: 'so1', vehicleId: 'v1', creationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), completionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), mileage: 148000, type: 'Preventivo', description: 'Cambio de aceite y filtros', parts: [{name: 'Filtro de Aceite', cost: 40, quantity: 1}, {name: 'Aceite Sintético (Galón)', cost: 25, quantity: 10}], laborCost: 150, downtimeCost: 600, totalCost: 1040 },
];


interface AppContextType {
    vehicles: Vehicle[];
    logs: MaintenanceLog[];
    serviceOrders: ServiceOrder[];
    routines: MaintenanceRoutine[];
    addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'isActive'>) => void;
    updateVehicle: (vehicleData: Vehicle) => void;
    deleteVehicle: (vehicleId: string) => void;
    toggleVehicleStatus: (vehicleId: string) => void;
    bulkDeleteVehicles: (vehicleIds: string[]) => void;
    bulkAddVehicles: (vehicles: Omit<Vehicle, 'id'>[]) => void;
    getVehicleById: (id: string) => Vehicle | undefined;
    
    addServiceOrder: (orderData: Omit<ServiceOrder, 'id' | 'status'>) => void;
    updateServiceOrderStatus: (orderId: string, status: ServiceOrderStatus) => void;
    closeServiceOrder: (orderId: string, logData: Omit<MaintenanceLog, 'id' | 'serviceOrderId' | 'downtimeCost' | 'totalCost' | 'creationDate' | 'type' | 'description'>) => void;
    
    logsForVehicle: (vehicleId: string) => MaintenanceLog[];
    serviceOrdersForVehicle: (vehicleId: string) => ServiceOrder[];
    bulkAddLogs: (logsData: Omit<MaintenanceLog, 'id' | 'downtimeCost' | 'totalCost'>[]) => void;

    addRoutine: (routineData: Omit<MaintenanceRoutine, 'id'>) => void;
    updateRoutine: (routineData: MaintenanceRoutine) => void;
    deleteRoutine: (routineId: string) => void;
    bulkAddRoutines: (routines: Omit<MaintenanceRoutine, 'id'>[]) => void;

    calculateOEEForVehicle: (vehicleId: string, days: number) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [logs, setLogs] = useState<MaintenanceLog[]>(initialLogs);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialServiceOrders);
    const [routines, setRoutines] = useState<MaintenanceRoutine[]>(initialRoutines);

    const getVehicleById = useCallback((id: string) => vehicles.find(v => v.id === id), [vehicles]);
    
    const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'isActive'>) => {
        const newVehicle: Vehicle = { ...vehicleData, id: uuidv4(), isActive: true };
        setVehicles(prev => [...prev, newVehicle]);
    };

    const updateVehicle = (vehicleData: Vehicle) => {
        setVehicles(prev => prev.map(v => v.id === vehicleData.id ? vehicleData : v));
    };

    const deleteVehicle = (vehicleId: string) => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        setServiceOrders(prev => prev.filter(so => so.vehicleId !== vehicleId));
        setLogs(prev => prev.filter(log => log.vehicleId !== vehicleId));
    };
    
    const bulkDeleteVehicles = (vehicleIds: string[]) => {
        setVehicles(prev => prev.filter(v => !vehicleIds.includes(v.id)));
        setServiceOrders(prev => prev.filter(so => !vehicleIds.includes(so.vehicleId)));
        setLogs(prev => prev.filter(log => !vehicleIds.includes(log.vehicleId)));
    };

    const toggleVehicleStatus = (vehicleId: string) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, isActive: !v.isActive } : v));
    };

    const bulkAddVehicles = (vehiclesData: Omit<Vehicle, 'id'>[]) => {
        const newVehicles = vehiclesData.map(v => ({ ...v, id: uuidv4() }));
        setVehicles(prev => [...prev, ...newVehicles]);
    };
    
    const addServiceOrder = (orderData: Omit<ServiceOrder, 'id'|'status'>) => {
        const newOrder: ServiceOrder = { ...orderData, id: uuidv4(), status: 'Abierta' };
        setServiceOrders(prev => [...prev, newOrder]);
    };
    
    const updateServiceOrderStatus = (orderId: string, status: ServiceOrderStatus) => {
        setServiceOrders(prev => prev.map(so => so.id === orderId ? { ...so, status } : so));
    };

    const closeServiceOrder = (orderId: string, logData: Omit<MaintenanceLog, 'id' | 'serviceOrderId' | 'downtimeCost' | 'totalCost' | 'creationDate' | 'type' | 'description'>) => {
        const serviceOrder = serviceOrders.find(so => so.id === orderId);
        const vehicle = vehicles.find(v => v.id === serviceOrder?.vehicleId);
        if (!serviceOrder || !vehicle) return;

        const creation = new Date(serviceOrder.creationDate);
        const completion = new Date(logData.completionDate);
        const downtimeDays = Math.max(1, Math.ceil((completion.getTime() - creation.getTime()) / (1000 * 3600 * 24)));
        const downtimeCost = serviceOrder.type === 'Correctivo' ? downtimeDays * vehicle.dailyOperationCost : 0;
        const partsCost = logData.parts.reduce((acc, part) => acc + (part.cost * part.quantity), 0);
        const totalCost = partsCost + logData.laborCost + downtimeCost;
        
        const newLog: MaintenanceLog = {
            ...logData,
            id: uuidv4(),
            serviceOrderId: orderId,
            creationDate: serviceOrder.creationDate,
            type: serviceOrder.type,
            description: serviceOrder.description,
            downtimeCost,
            totalCost,
        };

        setLogs(prev => [...prev, newLog]);
        updateServiceOrderStatus(orderId, 'Cerrada');
        // Update vehicle mileage
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, mileage: logData.mileage } : v));
    };

    const logsForVehicle = (vehicleId: string) => logs.filter(log => log.vehicleId === vehicleId);
    const serviceOrdersForVehicle = (vehicleId: string) => serviceOrders.filter(so => so.vehicleId === vehicleId);

    const bulkAddLogs = (logsData: Omit<MaintenanceLog, 'id' | 'downtimeCost' | 'totalCost'>[]) => {
        const newLogs = logsData.map(logData => {
            const vehicle = getVehicleById(logData.vehicleId);
            if (!vehicle) return null;
            const downtimeDays = Math.max(1, Math.ceil((new Date(logData.completionDate).getTime() - new Date(logData.creationDate).getTime()) / (1000 * 3600 * 24)));
            const downtimeCost = logData.type === 'Correctivo' ? downtimeDays * vehicle.dailyOperationCost : 0;
            const partsCost = logData.parts.reduce((acc, part) => acc + (part.cost * part.quantity), 0);
            const totalCost = partsCost + logData.laborCost + downtimeCost;
            return { ...logData, id: uuidv4(), downtimeCost, totalCost };
        }).filter((l): l is MaintenanceLog => l !== null);
        setLogs(prev => [...prev, ...newLogs]);
    };
    
    const addRoutine = (routineData: Omit<MaintenanceRoutine, 'id'>) => {
        const newRoutine: MaintenanceRoutine = { ...routineData, id: uuidv4() };
        setRoutines(prev => [...prev, newRoutine]);
    };

    const updateRoutine = (routineData: MaintenanceRoutine) => {
        setRoutines(prev => prev.map(r => r.id === routineData.id ? routineData : r));
    };

    const deleteRoutine = (routineId: string) => {
        setRoutines(prev => prev.filter(r => r.id !== routineId));
    };

    const bulkAddRoutines = (routinesData: Omit<MaintenanceRoutine, 'id'>[]) => {
        const newRoutines = routinesData.map(r => ({ ...r, id: uuidv4() }));
        setRoutines(prev => [...prev, ...newRoutines]);
    };

    const calculateOEEForVehicle = (vehicleId: string, days: number): number => {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        const vehicleLogs = logs.filter(log =>
            log.vehicleId === vehicleId && new Date(log.creationDate) >= sinceDate
        );

        let totalDowntimeDays = 0;
        vehicleLogs.forEach(log => {
            const start = new Date(log.creationDate);
            const end = new Date(log.completionDate);
            const downtime = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
            totalDowntimeDays += downtime;
        });

        const availability = ((days - totalDowntimeDays) / days) * 100;
        return Math.max(0, availability); // Ensure it's not negative
    };


    const contextValue = useMemo(() => ({
        vehicles, logs, serviceOrders, routines,
        addVehicle, updateVehicle, deleteVehicle, toggleVehicleStatus, bulkDeleteVehicles, bulkAddVehicles, getVehicleById,
        addServiceOrder, updateServiceOrderStatus, closeServiceOrder,
        logsForVehicle, serviceOrdersForVehicle, bulkAddLogs,
        addRoutine, updateRoutine, deleteRoutine, bulkAddRoutines,
        calculateOEEForVehicle
    }), [vehicles, logs, serviceOrders, routines, getVehicleById]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};