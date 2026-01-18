import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Droplets, ArrowRight } from 'lucide-react';
import { cn } from '../utils';

export const CalculatorComponent: React.FC = () => {
  // Inputs
  const [fieldArea, setFieldArea] = useState<number>(5); // ha
  const [tankCapacity, setTankCapacity] = useState<number>(2000); // litry
  const [waterRate, setWaterRate] = useState<number>(200); // l/ha (wydatek cieczy)
  const [chemicalDosage, setChemicalDosage] = useState<number>(0.5); // l/ha lub kg/ha

  // Outputs
  const [totalWaterNeeded, setTotalWaterNeeded] = useState<number>(0);
  const [totalChemicalNeeded, setTotalChemicalNeeded] = useState<number>(0);
  const [fullTanks, setFullTanks] = useState<number>(0);
  const [lastTankWater, setLastTankWater] = useState<number>(0);
  const [chemicalPerFullTank, setChemicalPerFullTank] = useState<number>(0);
  const [chemicalPerLastTank, setChemicalPerLastTank] = useState<number>(0);

  useEffect(() => {
    // 1. Ile cieczy łącznie potrzeba na całe pole
    const totalSolution = fieldArea * waterRate;
    setTotalWaterNeeded(totalSolution);

    // 2. Ile środka łącznie potrzeba
    const totalChem = fieldArea * chemicalDosage;
    setTotalChemicalNeeded(totalChem);

    // 3. Liczba opryskiwaczy
    const numberOfTanksExact = totalSolution / tankCapacity;
    const fullTanksCount = Math.floor(numberOfTanksExact);
    setFullTanks(fullTanksCount);

    // 4. Reszta w ostatnim zbiorniku
    const remainder = totalSolution % tankCapacity;
    setLastTankWater(Math.round(remainder)); // Zaokrąglamy dla czytelności

    // 5. Środek na pełny zbiornik
    // Jeśli pełny zbiornik to tankCapacity, a wydatek to waterRate:
    // Powierzchnia zrobiona na pełnym zbiorniku = tankCapacity / waterRate
    // Ilość środka = Powierzchnia * chemicalDosage
    const areaPerTank = tankCapacity / waterRate;
    setChemicalPerFullTank(parseFloat((areaPerTank * chemicalDosage).toFixed(3)));

    // 6. Środek na ostatni zbiornik
    const areaLastTank = remainder / waterRate;
    setChemicalPerLastTank(parseFloat((areaLastTank * chemicalDosage).toFixed(3)));

  }, [fieldArea, tankCapacity, waterRate, chemicalDosage]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-agro-600" />
          Kalkulator Mieszanin
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* INPUTS */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Parametry zabiegu</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powierzchnia pola (ha)</label>
              <input
                type="number"
                value={fieldArea}
                onChange={(e) => setFieldArea(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-500 focus:border-agro-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pojemność opryskiwacza (l)</label>
              <input
                type="number"
                value={tankCapacity}
                onChange={(e) => setTankCapacity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-500 focus:border-agro-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wydatek wody (l/ha)</label>
                <input
                  type="number"
                  value={waterRate}
                  onChange={(e) => setWaterRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-500 focus:border-agro-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dawka środka (l/ha)</label>
                <input
                  type="number"
                  step="0.05"
                  value={chemicalDosage}
                  onChange={(e) => setChemicalDosage(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-500 focus:border-agro-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* OUTPUTS */}
          <div className="bg-agro-50 rounded-xl p-6 border border-agro-100">
            <h3 className="text-sm font-semibold text-agro-800 uppercase tracking-wider mb-4">Wyniki obliczeń</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-agro-200">
                <span className="text-agro-700">Całkowita woda:</span>
                <span className="text-xl font-bold text-agro-900">{totalWaterNeeded.toLocaleString()} l</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-agro-200">
                <span className="text-agro-700">Całkowita ilość środka:</span>
                <span className="text-xl font-bold text-agro-900">{totalChemicalNeeded.toLocaleString()} l/kg</span>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Instrukcja napełniania
                </h4>
                
                <ul className="space-y-4">
                  {fullTanks > 0 && (
                     <li className="flex items-start gap-3">
                       <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full mt-0.5">{fullTanks}x</span>
                       <div className="text-sm text-gray-700">
                         Pełnych zbiorników ({tankCapacity} l).<br/>
                         Wlej <span className="font-bold text-gray-900">{chemicalPerFullTank} l/kg</span> środka do każdego.
                       </div>
                     </li>
                  )}
                  
                  {lastTankWater > 0 && (
                    <li className="flex items-start gap-3">
                       <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full mt-0.5">Ostatni</span>
                       <div className="text-sm text-gray-700">
                         Dolewka <span className="font-bold">{lastTankWater} l</span> wody.<br/>
                         Wlej <span className="font-bold text-gray-900">{chemicalPerLastTank} l/kg</span> środka.
                       </div>
                     </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800">
          Pamiętaj o kolejności mieszania! Najpierw woda (1/2 zbiornika), włączone mieszadło, potem środki sypkie, zawiesinowe, emulsyjne, a na końcu roztworowe.
        </p>
      </div>
    </div>
  );
};