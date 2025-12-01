import React from 'react';
import { Phone, Ambulance } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export const EmergencyButton: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
      <div className="relative group">
        <div className="absolute -inset-1 bg-red-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <button
          onClick={onClick}
          className="relative w-64 h-64 bg-red-600 rounded-full flex flex-col items-center justify-center shadow-2xl hover:bg-red-700 active:scale-95 transition-all duration-300 emergency-pulse border-8 border-red-400"
        >
          <Ambulance size={64} className="text-white mb-2" />
          <span className="text-2xl font-bold text-white uppercase tracking-wider">SOS</span>
          <span className="text-white font-medium text-sm mt-1">Chamar Ambulância</span>
        </button>
      </div>
      
      <p className="text-gray-500 text-center max-w-xs mt-8">
        Pressione o botão acima apenas em caso de emergência médica real.
        <br/>
        <span className="text-xs text-gray-400 mt-2 block">Sua localização será compartilhada automaticamente.</span>
      </p>

      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        <Phone size={18} />
        <span className="font-semibold">Ou ligue 192</span>
      </div>
    </div>
  );
};