import React, { useState } from 'react';
import { User, Ambulance, Activity, Lock, KeyRound, X, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  onSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<Props> = ({ onSelect }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleResponderClick = () => {
    setShowAuth(true);
    setError('');
    setAccessCode('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for demo purposes
    if (accessCode === '1920' || accessCode === 'admin') {
      onSelect('RESPONDER');
    } else {
      setError('Código de acesso inválido');
      setAccessCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-900/50">
            <Activity size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">ResgateJá</h1>
        <p className="text-slate-400 mt-2">Sistema Integrado de Emergência</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10">
        {/* Patient Button */}
        <button
          onClick={() => onSelect('PATIENT')}
          className="group relative bg-white hover:bg-red-50 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center text-center border-b-8 border-red-500"
        >
          <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:bg-red-200 transition-colors">
            <User size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sou Paciente</h2>
          <p className="text-gray-500 text-sm">
            Preciso de ajuda médica ou quero gerenciar meu perfil.
          </p>
        </button>

        {/* Responder Button */}
        <button
          onClick={handleResponderClick}
          className="group relative bg-slate-800 hover:bg-slate-750 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 flex flex-col items-center text-center border-b-8 border-blue-500"
        >
          <div className="absolute top-4 right-4 text-slate-600 group-hover:text-blue-400 transition">
            <Lock size={20} />
          </div>
          <div className="bg-slate-700 p-4 rounded-full mb-4 group-hover:bg-slate-600 transition-colors">
            <Ambulance size={40} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sou Socorrista</h2>
          <p className="text-slate-400 text-sm">
            Acesso à central de chamados e despacho de ambulâncias.
          </p>
        </button>
      </div>
      
      <p className="mt-12 text-slate-600 text-xs text-center max-w-md">
        Selecione o perfil adequado. O acesso de socorrista é restrito a pessoal autorizado.
      </p>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center">
                <KeyRound size={18} className="mr-2" />
                Acesso Restrito
              </h3>
              <button 
                onClick={() => setShowAuth(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Acesso da Central
                </label>
                <input
                  type="password"
                  autoFocus
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="mb-4 flex items-center text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
              >
                Entrar no Sistema
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Dica para demo: use <strong>1920</strong>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};