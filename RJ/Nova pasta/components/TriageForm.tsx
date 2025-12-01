import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { PatientProfile } from '../types';

interface Props {
  onSubmit: (name: string, symptoms: string, conscious: boolean, useProfile: boolean) => void;
  isProcessing: boolean;
  userProfile: PatientProfile | null;
}

export const TriageForm: React.FC<Props> = ({ onSubmit, isProcessing, userProfile }) => {
  const [name, setName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [conscious, setConscious] = useState(true);
  const [useProfile, setUseProfile] = useState(false);

  // Auto-fill name if user selects "It's me" and profile exists
  useEffect(() => {
    if (useProfile && userProfile) {
      setName(userProfile.fullName);
    } else if (useProfile && !userProfile) {
      // Should not happen due to conditional rendering, but safety check
      setUseProfile(false);
    }
  }, [useProfile, userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim().length < 3) return;
    onSubmit(name, symptoms, conscious, useProfile);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg mt-4 mb-20">
      <div className="flex items-center space-x-2 mb-6 text-red-600">
        <AlertCircle size={24} />
        <h2 className="text-xl font-bold">Dados da Vítima</h2>
      </div>

      {userProfile && (
        <div 
          onClick={() => setUseProfile(!useProfile)}
          className={`mb-6 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center ${useProfile ? 'border-slate-800 bg-slate-50' : 'border-gray-100 hover:border-gray-300'}`}
        >
          <div className={`p-2 rounded-full mr-3 ${useProfile ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
            <UserCheck size={20} />
          </div>
          <div>
             <span className="font-bold text-gray-800 block">A vítima sou eu</span>
             <span className="text-xs text-gray-500">Usar minha Ficha Médica ({userProfile.fullName})</span>
          </div>
          <div className="ml-auto">
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${useProfile ? 'border-slate-800' : 'border-gray-300'}`}>
                {useProfile && <div className="w-3 h-3 bg-slate-800 rounded-full" />}
             </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Vítima (Opcional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={useProfile} // Disable if using profile
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition ${useProfile ? 'bg-gray-100 text-gray-500' : ''}`}
            placeholder="Ex: João da Silva"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O que aconteceu? (Sintomas)*</label>
          <textarea
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition h-32 resize-none"
            placeholder="Ex: Dor forte no peito, dificuldade para respirar, desmaiou..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-gray-800">A vítima está consciente?</span>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                checked={conscious}
                onChange={(e) => setConscious(e.target.checked)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6"
                style={{ 
                  borderColor: conscious ? '#ef4444' : '#e5e7eb',
                  right: conscious ? '0' : '50%',
                  transform: conscious ? 'translateX(0)' : 'translateX(100%)' 
                }}
              />
              <div 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${conscious ? 'bg-red-500' : 'bg-gray-300'}`}
              ></div>
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            {conscious ? "A vítima responde a estímulos." : "A vítima NÃO responde."}
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing || symptoms.length < 3}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Analisando com IA...
            </>
          ) : (
            "Solicitar Resgate Agora"
          )}
        </button>
      </form>
    </div>
  );
};