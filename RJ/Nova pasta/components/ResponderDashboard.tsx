import React, { useState, useEffect } from 'react';
import { RescueRequest, EmergencySeverity } from '../types';
import { 
  Siren, MapPin, User, Activity, Clock, Phone, 
  ShieldCheck, AlertTriangle, CheckCircle2, Navigation, LogOut
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export const ResponderDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeRequest, setActiveRequest] = useState<RescueRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll for new requests (simulating websocket/server push)
  useEffect(() => {
    const checkRequests = () => {
      const stored = localStorage.getItem('resgateja_active_request');
      if (stored) {
        try {
          const parsed: RescueRequest = JSON.parse(stored);
          // Only update if data changed to avoid re-renders or if null
          setActiveRequest(prev => {
            if (!prev || prev.id !== parsed.id || prev.status !== parsed.status) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error("Error parsing request", e);
        }
      } else {
        setActiveRequest(null);
      }
      setLoading(false);
    };

    checkRequests();
    const interval = setInterval(checkRequests, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (newStatus: RescueRequest['status']) => {
    if (!activeRequest) return;
    
    const updatedRequest = { ...activeRequest, status: newStatus };
    
    // Determine ETA changes based on status
    if (newStatus === 'ARRIVED') updatedRequest.etaMinutes = 0;
    if (newStatus === 'COMPLETED') {
        // Clear active request after a delay or move to history (logic simplified here)
        localStorage.removeItem('resgateja_active_request');
        setActiveRequest(null);
        return;
    }

    setActiveRequest(updatedRequest);
    localStorage.setItem('resgateja_active_request', JSON.stringify(updatedRequest));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando sistema...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col h-auto md:min-h-screen">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between md:block">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <Activity className="text-red-500 mr-2" />
              Central 192
            </h1>
            <p className="text-xs text-slate-400 mt-1">Painel de Controle</p>
          </div>
          <button onClick={onLogout} className="md:hidden text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Chamados Ativos</div>
          
          {activeRequest ? (
            <div className="bg-red-600 rounded-xl p-4 shadow-lg cursor-pointer border-l-4 border-red-400">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-800 text-xs px-2 py-1 rounded font-bold">EM ANDAMENTO</span>
                <span className="text-xs opacity-75">{new Date(activeRequest.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <h3 className="font-bold truncate">{activeRequest.victim.name || "Desconhecido"}</h3>
              <p className="text-sm opacity-90 truncate">{activeRequest.victim.symptoms}</p>
              <div className="mt-3 flex items-center text-xs font-medium bg-red-700 bg-opacity-50 p-2 rounded">
                <MapPin size={12} className="mr-1" />
                {activeRequest.location ? 'Localização Recebida' : 'Sem GPS'}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem chamados ativos no momento.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 hidden md:block">
          <button 
            onClick={onLogout}
            className="flex items-center text-sm text-slate-400 hover:text-white transition w-full"
          >
            <LogOut size={16} className="mr-2" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {!activeRequest ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Siren size={64} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-bold text-slate-600">Aguardando Chamados</h2>
            <p>O sistema buscará novas solicitações automaticamente.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="mb-4 md:mb-0">
                 <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    Caso #{activeRequest.id.slice(0, 8)}
                    {activeRequest.triage?.severity === EmergencySeverity.HIGH && (
                        <span className="ml-3 bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-bold border border-red-200">
                            ALTA PRIORIDADE
                        </span>
                    )}
                 </h2>
                 <p className="text-slate-500 flex items-center mt-1">
                    Status Atual: <span className="font-bold text-slate-800 ml-1 uppercase">{activeRequest.status === 'DISPATCHED' ? 'Ambulância Enviada' : activeRequest.status}</span>
                 </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                 {activeRequest.status === 'DISPATCHED' && (
                     <button 
                        onClick={() => updateStatus('ARRIVED')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition"
                     >
                        <Navigation size={18} className="mr-2" />
                        Marcar Chegada
                     </button>
                 )}
                 {(activeRequest.status === 'ARRIVED' || activeRequest.status === 'DISPATCHED') && (
                     <button 
                        onClick={() => updateStatus('COMPLETED')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition"
                     >
                        <CheckCircle2 size={18} className="mr-2" />
                        Finalizar Ocorrência
                     </button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Info Column */}
                <div className="space-y-6">
                    {/* Vital Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <User className="mr-2 text-blue-500" />
                            Paciente
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Nome</label>
                                <p className="text-lg font-medium">{activeRequest.victim.name || "Não informado"}</p>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Estado</label>
                                    <div className={`mt-1 inline-flex items-center px-2 py-1 rounded text-sm font-bold ${activeRequest.victim.conscious ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {activeRequest.victim.conscious ? 'Consciente' : 'INCONSCIENTE'}
                                    </div>
                                </div>
                                {activeRequest.victim.profileData && (
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Idade</label>
                                        <p className="text-sm font-medium mt-1">{
                                            new Date().getFullYear() - new Date(activeRequest.victim.profileData.dateOfBirth).getFullYear()
                                        } anos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Medical Profile Card (if exists) */}
                    {activeRequest.victim.profileData && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                <ShieldCheck className="mr-2 text-slate-600" />
                                Histórico Médico
                            </h3>
                            <div className="space-y-3">
                                {activeRequest.victim.profileData.allergies && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                                        <span className="text-xs font-bold text-red-600 block mb-1">ALERGIAS</span>
                                        <p className="text-sm text-gray-800">{activeRequest.victim.profileData.allergies}</p>
                                    </div>
                                )}
                                {activeRequest.victim.profileData.medicalConditions && (
                                    <div className="bg-white p-3 rounded border border-slate-200">
                                        <span className="text-xs font-bold text-slate-500 block mb-1">CONDIÇÕES</span>
                                        <p className="text-sm text-gray-800">{activeRequest.victim.profileData.medicalConditions}</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-slate-200 mt-2">
                                     <span className="text-xs font-bold text-slate-500 block mb-1">CONTATO DE EMERGÊNCIA</span>
                                     <div className="flex items-center text-sm font-medium">
                                        <Phone size={14} className="mr-2 text-slate-400" />
                                        {activeRequest.victim.profileData.contact.name} ({activeRequest.victim.profileData.contact.relation})
                                     </div>
                                     <div className="text-sm ml-6 text-slate-600">{activeRequest.victim.profileData.contact.phone}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Situation & Map Column */}
                <div className="lg:col-span-2 space-y-6">
                     {/* Map Placeholder */}
                     <div className="bg-slate-200 rounded-2xl h-64 w-full relative overflow-hidden flex items-center justify-center border-2 border-white shadow-sm group">
                        <div className="absolute inset-0 bg-slate-300 opacity-20" style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                        {activeRequest.location ? (
                            <div className="text-center z-10">
                                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-pulse ring-4 ring-blue-300">
                                    <MapPin className="text-white" size={32} />
                                </div>
                                <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-mono font-bold text-slate-700">
                                    {activeRequest.location.latitude.toFixed(5)}, {activeRequest.location.longitude.toFixed(5)}
                                </div>
                                <div className="mt-4">
                                     <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${activeRequest.location.latitude},${activeRequest.location.longitude}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                                     >
                                        Abrir no Google Maps
                                     </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500">
                                <AlertTriangle size={40} className="mb-2" />
                                <span className="font-semibold">Localização não disponível</span>
                            </div>
                        )}
                     </div>

                     {/* AI Triage Analysis */}
                     {activeRequest.triage && (
                         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <Activity className="mr-2 text-purple-600" />
                                    Análise de IA e Sintomas
                                </h3>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                    Sugestão: {activeRequest.triage.department}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Relato da Vítima</label>
                                    <p className="text-lg italic text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        "{activeRequest.victim.symptoms}"
                                    </p>
                                </div>
                                
                                <div>
                                     <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Orientação Prévia do Sistema</label>
                                     <div className="flex items-start">
                                        <div className="min-w-[4px] h-full bg-blue-500 mr-4 self-stretch rounded-full"></div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {activeRequest.triage.advice}
                                        </p>
                                     </div>
                                </div>
                            </div>
                         </div>
                     )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};