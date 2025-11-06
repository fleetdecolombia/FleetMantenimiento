export interface Vehicle {
  id: string;
  name: string; // License plate
  make: string;
  model: string;
  year: number;
  mileage: number;
  dailyOperationCost: number;
  isActive: boolean;
}

export interface MaintenancePart {
  name: string;
  cost: number;
  quantity: number;
}

export interface MaintenanceLog {
  id:string;
  vehicleId: string;
  serviceOrderId: string;
  creationDate: string; // ISO date string
  completionDate: string; // ISO date string
  mileage: number;
  type: 'Preventivo' | 'Correctivo';
  description: string;
  parts: MaintenancePart[];
  laborCost: number;
  downtimeCost: number; 
  totalCost: number; 
}

export type ServiceOrderStatus = 'Abierta' | 'En Progreso' | 'Cerrada';

export interface ServiceOrder {
  id: string;
  vehicleId: string;
  creationDate: string; // ISO date string for entry
  plannedExitDate: string; // ISO date string for planned exit
  type: 'Preventivo' | 'Correctivo';
  status: ServiceOrderStatus;
  description: string;
  parts: MaintenancePart[];
  laborHours: number;
  laborCost: number;
}

export interface MaintenanceRoutine {
    id: string;
    name: string;
    frequencyMileage: number;
    parts: MaintenancePart[];
    laborHours: number;
    laborCost: number;
}