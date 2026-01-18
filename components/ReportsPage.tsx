import React from 'react';
import { MOCK_TREATMENTS, MOCK_FIELDS, MOCK_USER } from '../constants';
import { Printer, FileText } from 'lucide-react';
import { formatDate } from '../utils';

// Step 3 & 5: Generator Raportu do Kontroli
export const ReportsPage: React.FC = () => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-agro-600"/> Raporty i Ewidencja
        </h2>
        <button 
          onClick={handlePrint} 
          className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
        >
          <Printer className="w-4 h-4" /> Drukuj Ewidencję (PDF)
        </button>
      </div>

      <div className="bg-white shadow-sm print:shadow-none p-8 min-h-screen print:p-0">
        
        {/* Report Header */}
        <div className="mb-8 border-b border-gray-900 pb-4">
           <h1 className="text-xl font-bold uppercase text-center mb-2">Ewidencja Zabiegów Ochrony Roślin</h1>
           <div className="flex justify-between text-sm">
             <div>
               <span className="font-bold">Posiadacz gruntów:</span> {MOCK_USER.fullName}<br/>
               <span className="font-bold">Adres:</span> Wiejska 1, 00-001 Rolniczowo<br/>
             </div>
             <div className="text-right">
               <span className="font-bold">Rok gospodarczy:</span> 2024<br/>
               <span className="font-bold">Data wydruku:</span> {new Date().toLocaleDateString()}
             </div>
           </div>
        </div>

        {/* PIORiN Table Structure */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-800">
             <thead>
               <tr className="bg-gray-100 print:bg-gray-100">
                 <th className="border border-gray-600 p-2 w-[12%]">Oznaczenie działki<br/>(Nazwa)</th>
                 <th className="border border-gray-600 p-2 w-[10%]">Numer działki rolnej<br/>(Ewidencyjny)</th>
                 <th className="border border-gray-600 p-2 w-[8%]">Roślina<br/>(Uprawa)</th>
                 <th className="border border-gray-600 p-2 w-[6%]">Pow.<br/>uprawy [ha]</th>
                 <th className="border border-gray-600 p-2 w-[6%]">Pow.<br/>zabiegu [ha]</th>
                 <th className="border border-gray-600 p-2 w-[8%]">Data wykonania</th>
                 <th className="border border-gray-600 p-2 w-[15%]">Nazwa środka (ŚOR)</th>
                 <th className="border border-gray-600 p-2 w-[15%]">Dawka i Substancja czynna</th>
                 <th className="border border-gray-600 p-2 w-[10%]">Przyczyna<br/>(Cel)</th>
                 <th className="border border-gray-600 p-2 w-[10%]">Wykonał / Uwagi</th>
               </tr>
             </thead>
             <tbody>
               {MOCK_TREATMENTS.map((treatment) => {
                 const field = MOCK_FIELDS.find(f => f.id === treatment.fieldId);
                 if (!field) return null;
                 
                 // Rowspan logic: The first 6 columns span across all items in a mixture
                 return treatment.items.map((item, index) => (
                   <tr key={item.chemicalId + index} className="print:break-inside-avoid">
                     {/* Common columns - render only for first item */}
                     {index === 0 && (
                       <>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {field.name}
                         </td>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {field.parcelNumber}
                         </td>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {field.currentCrop}
                         </td>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {field.areaCrop.toFixed(2)}
                         </td>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {field.areaCrop.toFixed(2)}
                         </td>
                         <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                           {formatDate(treatment.date)}<br/>
                           {treatment.startTime} - {treatment.endTime}
                         </td>
                       </>
                     )}
                     
                     {/* Item specific columns */}
                     <td className="border border-gray-600 p-2 font-medium">
                       {item.chemicalName}
                     </td>
                     <td className="border border-gray-600 p-2">
                       <div className="font-bold">{item.dosage} {item.unit}/ha</div>
                       <div className="text-[10px] italic text-gray-600 mt-1">
                         {item.activeSubstanceSnapshot}<br/>
                         ({item.activeSubstanceContentSnapshot})
                       </div>
                     </td>
                     <td className="border border-gray-600 p-2">
                       {item.target}
                     </td>
                     
                     {/* Notes column - render only for first item */}
                     {index === 0 && (
                       <td className="border border-gray-600 p-2 text-center" rowSpan={treatment.items.length}>
                         {treatment.operatorName}<br/>
                         <span className="text-[9px]">
                           Temp: {treatment.temperature}°C<br/>
                           Wiatr: {treatment.windSpeed} m/s
                         </span>
                       </td>
                     )}
                   </tr>
                 ));
               })}
               
               {MOCK_TREATMENTS.length === 0 && (
                 <tr>
                   <td colSpan={10} className="p-8 text-center text-gray-400">Brak zabiegów w wybranym okresie.</td>
                 </tr>
               )}
             </tbody>
          </table>
          
          <div className="mt-8 pt-8 border-t text-xs text-center text-gray-400 print:text-black print:mt-16">
            Wygenerowano automatycznie z systemu <strong>agrotechniczne.pl</strong>. Dokument nie wymaga podpisu jeśli jest prowadzony w formie elektronicznej.
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root, #root * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
          }
          /* Hide Sidebar and other layout elements */
          aside, header, nav {
            display: none !important;
          }
          /* Reset main margins */
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};