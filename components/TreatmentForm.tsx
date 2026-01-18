import React, { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { MOCK_FIELDS, MOCK_WAREHOUSE, MOCK_MACHINES, MOCK_USER } from '../constants';
import { Unit } from '../types';
import { Save, Plus, Trash2, Wind, Thermometer, Droplets, User, Tractor, Sprout, AlertTriangle } from 'lucide-react';
import { cn } from '../utils';

interface TreatmentFormData {
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  machineId: string;
  operatorName: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  waterVolume: number; // l/ha
  items: {
    chemicalId: string;
    dosage: number; // per ha
    target: string;
  }[];
}

export const TreatmentForm: React.FC = () => {
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<TreatmentFormData>({
    defaultValues: {
      fieldId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '10:00',
      machineId: '',
      operatorName: MOCK_USER.fullName,
      temperature: 15,
      windSpeed: 2,
      humidity: 60,
      waterVolume: 200,
      items: [{ chemicalId: '', dosage: 0, target: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Watch values for live calculations
  const watchedFieldId = useWatch({ control, name: 'fieldId' });
  const watchedMachineId = useWatch({ control, name: 'machineId' });
  const watchedWaterVolume = useWatch({ control, name: 'waterVolume' });

  // Derived state
  const selectedField = MOCK_FIELDS.find(f => f.id === watchedFieldId);
  const selectedMachine = MOCK_MACHINES.find(m => m.id === watchedMachineId);

  // Auto-fill details based on chemical selection (optional handler)
  const handleChemicalChange = (index: number, chemId: string) => {
    const chem = MOCK_WAREHOUSE.find(c => c.id === chemId);
    if (chem) {
       setValue(`items.${index}.target`, chem.registrationTarget);
    }
  };

  const onSubmit = (data: TreatmentFormData) => {
    console.log('Sending transaction to API:', data);
    setSuccessMsg('Zabieg zapisany pomyślnie. Stany magazynowe zaktualizowane.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sprout className="text-agro-600"/> Nowy Zabieg (Mieszanina)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Tworzenie wpisu do ewidencji (Transaction-based)</p>
        </div>
        <div className="text-right text-xs text-gray-400">
           ID Sesji: {MOCK_USER.id}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        {successMsg && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2 border border-green-200">
            <User className="w-5 h-5"/> {successMsg}
          </div>
        )}

        {/* SECTION 1: CONTEXT (Where, When, Who) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Lokalizacja i Czas</h3>
              
              <div>
                <label className="label">Pole uprawne *</label>
                <select {...register('fieldId', { required: true })} className="input-field">
                  <option value="">Wybierz pole...</option>
                  {MOCK_FIELDS.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.areaCrop} ha) - {f.currentCrop}</option>
                  ))}
                </select>
                {selectedField && (
                   <p className="text-xs text-gray-500 mt-1">Nr ew: {selectedField.parcelNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="label">Data</label>
                   <input type="date" {...register('date')} className="input-field" />
                 </div>
                 <div>
                    <label className="label">Operator</label>
                    <input type="text" {...register('operatorName')} className="input-field" />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">2. Sprzęt i Pogoda</h3>
              
              <div>
                <label className="label flex items-center gap-1"><Tractor className="w-3 h-3"/> Opryskiwacz</label>
                <select {...register('machineId')} className="input-field">
                  <option value="">Wybierz maszynę...</option>
                  {MOCK_MACHINES.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.tankCapacity} l)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                   <label className="label text-[10px]">Temp (°C)</label>
                   <input type="number" {...register('temperature')} className="input-field px-1" />
                </div>
                <div className="relative">
                   <label className="label text-[10px]">Wiatr (m/s)</label>
                   <input type="number" step="0.1" {...register('windSpeed')} className="input-field px-1" />
                </div>
                <div className="relative">
                   <label className="label text-[10px]">Wilgotność (%)</label>
                   <input type="number" {...register('humidity')} className="input-field px-1" />
                </div>
              </div>
           </div>

           {/* CALCULATOR PANEL */}
           <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4"/> Kalkulator Cieczy
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                   <div className="flex justify-between">
                      <span>Obszar pola:</span>
                      <span className="font-bold">{selectedField ? selectedField.areaCrop : 0} ha</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span>Woda (l/ha):</span>
                      <input 
                        type="number" 
                        {...register('waterVolume', { valueAsNumber: true })} 
                        className="w-16 h-6 text-right rounded border-blue-200 text-xs" 
                      />
                   </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                 <div className="flex justify-between text-blue-900 font-bold text-lg">
                    <span>Razem ciecz:</span>
                    <span>
                      {selectedField && watchedWaterVolume ? (selectedField.areaCrop * watchedWaterVolume).toFixed(0) : 0} l
                    </span>
                 </div>
                 {selectedMachine && selectedField && (
                   <div className="text-xs text-blue-600 mt-1 text-right">
                      ~ {Math.ceil((selectedField.areaCrop * watchedWaterVolume) / selectedMachine.tankCapacity)} pełnych zbiorników
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* SECTION 3: TANK MIX (Dynamic Items) */}
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">3. Mieszanina Zbiornikowa (Środki)</h3>
             <button type="button" onClick={() => append({ chemicalId: '', dosage: 0, target: '' })} className="btn-secondary text-xs py-1">
               <Plus className="w-4 h-4" /> Dodaj składnik
             </button>
          </div>

          <div className="space-y-4">
             {fields.map((field, index) => {
               // Get this specific item's chemical info for validation
               return (
                 <TreatmentItemRow 
                   key={field.id} 
                   index={index} 
                   register={register} 
                   remove={remove} 
                   fieldArea={selectedField?.areaCrop || 0}
                   onChemicalSelect={handleChemicalChange}
                   control={control}
                 />
               );
             })}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
           <button type="submit" className="bg-agro-600 hover:bg-agro-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-agro-600/20 transition-all flex items-center gap-2">
             <Save className="w-5 h-5" />
             Zatwierdź Zabieg
           </button>
        </div>
      </form>
      
      <style>{`
        .label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
        }
        .input-field {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background-color: #fff;
        }
        .input-field:focus {
          border-color: #059669;
          outline: 2px solid #a7f3d0;
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background-color: #f3f4f6;
          color: #374151;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

// Subcomponent for individual rows to handle internal logic cleanly
const TreatmentItemRow = ({ index, register, remove, fieldArea, onChemicalSelect, control }: any) => {
   const watchedChemId = useWatch({ control, name: `items.${index}.chemicalId` });
   const watchedDosage = useWatch({ control, name: `items.${index}.dosage` });
   
   const chem = MOCK_WAREHOUSE.find(c => c.id === watchedChemId);
   const totalNeeded = fieldArea * watchedDosage;
   const isShortage = chem && totalNeeded > chem.quantity;

   return (
     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
           
           {/* Chemical Selection */}
           <div className="md:col-span-4">
              <label className="label">Środek / Nawóz</label>
              <select 
                {...register(`items.${index}.chemicalId`, { 
                  required: true,
                  onChange: (e: any) => onChemicalSelect(index, e.target.value)
                })} 
                className="input-field"
              >
                <option value="">Wybierz z magazynu...</option>
                {MOCK_WAREHOUSE.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.quantity} {c.unit} avail)
                  </option>
                ))}
              </select>
              {chem && (
                <div className="text-[10px] text-gray-500 mt-1">
                   Substancja: {chem.activeSubstance} ({chem.activeSubstanceContent})
                </div>
              )}
           </div>

           {/* Dosage */}
           <div className="md:col-span-2">
              <label className="label">Dawka (l/kg na ha)</label>
              <input 
                type="number" 
                step="0.001" 
                {...register(`items.${index}.dosage`, { required: true, min: 0.0001 })} 
                className={cn("input-field font-bold", isShortage ? "text-red-600 border-red-300 bg-red-50" : "text-gray-900")}
              />
           </div>

           {/* Total Calculation */}
           <div className="md:col-span-2">
              <label className="label">Razem na pole</label>
              <div className={cn("px-3 py-2 rounded border bg-gray-100 text-sm font-bold flex items-center justify-between", isShortage ? "border-red-300 text-red-700" : "border-gray-200 text-gray-700")}>
                 {totalNeeded.toFixed(2)} {chem?.unit || ''}
                 {isShortage && <AlertTriangle className="w-4 h-4 text-red-500"/>}
              </div>
           </div>

           {/* Target (Reason) */}
           <div className="md:col-span-3">
              <label className="label">Cel zwalczania (PIORiN)</label>
              <input 
                type="text" 
                {...register(`items.${index}.target`, { required: true })} 
                className="input-field"
                placeholder="np. Chwasty dwuliścienne"
              />
           </div>

           {/* Remove Button */}
           <div className="md:col-span-1 flex justify-end pt-6">
              <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
           </div>
        </div>
        {isShortage && (
           <div className="absolute -bottom-3 right-4 bg-red-100 text-red-700 text-xs px-2 py-1 rounded shadow-sm border border-red-200">
             Stan magazynowy: {chem?.quantity} {chem?.unit} (Brak: {(totalNeeded - chem!.quantity).toFixed(2)})
           </div>
        )}
     </div>
   );
};