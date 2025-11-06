import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAppContext } from '../context/AppContext';
import { ArrowUpTrayIcon } from './Icons';
import { MaintenanceRoutine } from '../types';

interface DataImportModalProps {
    onClose: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ onClose }) => {
    const { bulkAddVehicles, bulkAddLogs, bulkAddRoutines } = useAppContext();
    const [feedback, setFeedback] = useState<string>('');

    const handleFileChange = (file: File | null, type: 'vehicles' | 'logs' | 'routines') => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            try {
                if (type === 'vehicles') {
                    const vehicles = parseVehiclesCSV(csv);
                    bulkAddVehicles(vehicles);
                    setFeedback(`${vehicles.length} vehículos importados exitosamente.`);
                } else if (type === 'logs') {
                    const logs = parseLogsCSV(csv);
                    bulkAddLogs(logs);
                    setFeedback(`${logs.length} registros de historial importados exitosamente.`);
                } else {
                    const routines = parseRoutinesCSV(csv);
                    bulkAddRoutines(routines);
                    setFeedback(`${routines.length} rutinas importadas exitosamente.`);
                }
            } catch (error: any) {
                setFeedback(`Error al procesar el archivo: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };
    
    const parseVehiclesCSV = (csv: string) => {
        const lines = csv.split('\n').slice(1); // skip header
        return lines.map(line => {
            const [name, make, model, year, mileage, dailyOperationCost] = line.split(',');
            if(!name) return null;
            return { name, make, model, year: parseInt(year), mileage: parseInt(mileage), dailyOperationCost: parseFloat(dailyOperationCost), isActive: true };
        }).filter(Boolean);
    };

    const parseLogsCSV = (csv: string) => {
        const lines = csv.split('\n').slice(1);
        return lines.map(line => {
             const [vehicleId, creationDate, completionDate, mileage, type, description, parts, laborCost] = line.split(',');
             if(!vehicleId) return null;
             return { vehicleId, creationDate, completionDate, mileage: parseInt(mileage), type, description, parts: [], laborCost: parseFloat(laborCost) };
        }).filter(Boolean);
    };

    const parseRoutinesCSV = (csv: string): Omit<MaintenanceRoutine, 'id'>[] => {
        const lines = csv.split('\n').slice(1);
        return lines.map(line => {
            const parts = line.split(',');
            if (parts.length < 3) return null;
            const name = parts[0];
            const frequencyMileage = parseInt(parts[1], 10);
            const laborCost = parseFloat(parts[2]);
            const partsJson = parts.slice(3).join(',');
            
            if (!name || isNaN(frequencyMileage) || isNaN(laborCost)) return null;

            let parsedParts: { name: string, cost: number }[] = [];
            if (partsJson) {
                try {
                    const cleanedJson = partsJson.replace(/^"/, '').replace(/"$/, '').replace(/""/g, '"');
                    parsedParts = JSON.parse(cleanedJson);
                } catch (e) {
                    console.error("Could not parse parts JSON:", partsJson, e);
                    parsedParts = [];
                }
            }

            return { name, frequencyMileage, laborCost, parts: parsedParts };
        }).filter(Boolean) as Omit<MaintenanceRoutine, 'id'>[];
    };

    return (
        <Modal title="Importar Datos Masivos desde CSV" onClose={onClose}>
            <div className="space-y-6">
                <FileUploader
                    title="Importar Flota de Vehículos"
                    description="CSV con columnas: name,make,model,year,mileage,dailyOperationCost"
                    onFileSelect={(file) => handleFileChange(file, 'vehicles')}
                />
                <FileUploader
                    title="Importar Historial de Mantenimiento"
                    description="CSV con columnas: vehicleId,creationDate,completionDate,mileage,type,description,parts(ignored),laborCost"
                    onFileSelect={(file) => handleFileChange(file, 'logs')}
                />
                 <FileUploader
                    title="Importar Rutinas de Mantenimiento"
                    description={`CSV: name,frequencyMileage,laborCost,parts (JSON string, e.g., "[{""name"":""Filter"",""cost"":10}]")`}
                    onFileSelect={(file) => handleFileChange(file, 'routines')}
                />
                {feedback && (
                    <div className="mt-4 p-3 text-center bg-gray-700 rounded-lg">
                        <p className="text-sm text-white">{feedback}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};


interface FileUploaderProps {
    title: string;
    description: string;
    onFileSelect: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ title, description, onFileSelect }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFileName(file ? file.name : '');
        onFileSelect(file);
    };
    
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg text-white">{title}</h4>
            <p className="text-xs text-gray-400 mb-2 break-words">Formato: {description}</p>
            <label className="w-full flex items-center justify-center px-4 py-3 bg-gray-700 text-gray-300 rounded-lg shadow-lg tracking-wide uppercase border border-dashed border-gray-600 cursor-pointer hover:bg-gray-600">
                <ArrowUpTrayIcon className="h-6 w-6" />
                <span className="ml-3 text-sm">{fileName || 'Seleccionar un archivo'}</span>
                <input type='file' className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
        </div>
    )
}