import React from 'react';
import { LayoutDashboard, Sprout, FlaskConical, Calculator, Menu, X, Tractor, FileText } from 'lucide-react';
import { cn } from '../utils';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard },
  { id: 'fields', label: 'Pola', icon: Sprout },
  { id: 'warehouse', label: 'Magazyn', icon: FlaskConical },
  { id: 'treatments', label: 'Zabiegi', icon: Tractor }, // Changed from Machines/Calc to more relevant
  { id: 'reports', label: 'Raporty (PIORiN)', icon: FileText },
];

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-agro-600 rounded-lg flex items-center justify-center">
             <Sprout className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">agrotechniczne<span className="text-agro-600">.pl</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activePage === item.id 
                  ? "bg-agro-50 text-agro-700 border border-agro-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">JK</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Jan Kowalski</p>
                <p className="text-xs text-gray-500 truncate">Plan PRO</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-agro-600 rounded-lg flex items-center justify-center">
             <Sprout className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-gray-800">agrotechniczne.pl</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-white pt-16 px-4 pb-4 print:hidden">
           <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg font-medium",
                  activePage === item.id 
                    ? "bg-agro-50 text-agro-700" 
                    : "text-gray-600"
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
           {children}
        </div>
      </main>

      {/* Mobile Sticky Bottom Nav (Optional alternative to Hamburger, simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around z-20 safe-area-bottom print:hidden">
        {NAV_ITEMS.slice(0, 4).map((item) => (
           <button 
             key={item.id}
             onClick={() => onNavigate(item.id)}
             className={cn(
               "flex flex-col items-center p-1",
               activePage === item.id ? "text-agro-600" : "text-gray-400"
             )}
           >
             <item.icon className="w-6 h-6" />
             <span className="text-[10px] mt-1 font-medium">{item.label}</span>
           </button>
        ))}
      </div>
    </div>
  );
};