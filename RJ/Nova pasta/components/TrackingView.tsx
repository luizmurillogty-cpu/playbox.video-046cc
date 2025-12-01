import React, { useEffect, useState } from 'react';
import { RescueRequest, EmergencySeverity } from '../types';
import { MapPin, Siren, Activity, ShieldCheck, User, Phone, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  request: RescueRequest;
}

export const TrackingView: React.FC<Props> = ({ request }) => {
  const [eta, setEta] = useState(request.etaMinutes);
  
  // Simulate ETA reduction
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000); // Reduce every minute
    return () => clearInterval(timer);
  }, []);

  const severityColor = {
    [EmergencySeverity.HIGH]: 'bg-red-100 text-red-800 border-red-200',
    [EmergencySeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [EmergencySeverity.LOW]: 'bg-green-100 text-green-800 border-green-200',
    [EmergencySeverity.UNKNOWN]: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const profile = request.victim.profileData;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-12">
      {/* Header Status */}
      <div className="bg-red-600 text-white p-6 rounded-b-3xl shadow-lg -mt-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Siren className="mr-2 animate-pulse" />
              Socorro a Caminho
            </h1>
            <p className="text-red-100 opacity-90 text-sm">ID: #{request.id.slice(0,8)}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{eta} min</div>
            <div className="text-xs uppercase opacity-80">ETA Estimado</div>
          </div>
        </div>
        
        {/* Victim Summary */}
        <div className="bg-red-700 bg-opacity-50 p-3 rounded-lg flex items-center text-sm">
           <User size={16} className="mr-2 text-red-200" />
           <span className="truncate font-semibold">
             {request.victim.name || "Vítima não identificada"}
           </span>
           <span className="mx-2 opacity-50">•</span>
           <span>
             {request.victim.conscious ? "Consciente" : "INCONSCIENTE"}
           </span>
        </div>
      </div>

      {/* Map Simulation */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mx-4 border border-gray-100">
        <div className="bg-gray-100 h-48 w-full relative flex items-center justify-center overflow-hidden">
             {/* Abstract Map Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Radar Animation */}
            <div className="absolute w-full h-full flex items-center justify-center">
                 <div className="w-32 h-32 border-4 border-blue-500 rounded-full opacity-20 animate-ping"></div>
            </div>

            {/* Pins */}
            <div className="z-10 flex flex-col items-center">
                 <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-2">Você</div>
                 <MapPin className="text-blue-600 drop-shadow-lg" size={40} fill="currentColor" />
            </div>
        </div>
        <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            {request.location ? 
              `${request.location.latitude.toFixed(4)}, ${request.location.longitude.toFixed(4)}` : 
              <span className="text-red-500 font-bold">Localização não enviada</span>
            }
          </div>
          <div className={`flex items-center font-semibold ${request.location ? 'text-green-600' : 'text-red-600'}`}>
            {request.location ? (
                <>
                    <Activity size={14} className="mr-1" />
                    GPS Ativo
                </>
            ) : (
                <>
                    <AlertTriangle size={14} className="mr-1" />
                    Sem sinal de GPS
                </>
            )}
          </div>
        </div>
      </div>

      {/* Medical Profile Card - Only if profile exists */}
      {profile && (
        <div className="mx-4 bg-slate-800 text-white rounded-xl shadow-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-900 p-3 flex justify-between items-center">
             <h3 className="font-bold flex items-center text-sm">
               <FileText size={16} className="mr-2 text-blue-400" />
               Ficha Médica do Paciente
             </h3>
             <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">Compartilhado</span>
          </div>
          <div className="p-4 space-y-3">
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span className="text-slate-400 text-xs block">Nascimento</span>
                   <span className="font-medium">{profile.dateOfBirth}</span>
                </div>
                <div>
                   <span className="text-slate-400 text-xs block">Contato ({profile.contact.relation})</span>
                   <div className="flex items-center font-medium">
                      <Phone size={12} className="mr-1" />
                      {profile.contact.phone}
                   </div>
                </div>
             </div>
             
             {profile.medicalConditions && (
               <div className="bg-slate-700 p-2 rounded">
                 <span className="text-xs text-slate-300 block mb-1">Condições</span>
                 <p className="text-sm font-medium">{profile.medicalConditions}</p>
               </div>
             )}

             {profile.allergies && (
               <div className="bg-red-900 bg-opacity-30 border border-red-900 p-2 rounded">
                 <span className="text-xs text-red-300 block mb-1 flex items-center">
                    <AlertTriangle size={10} className="mr-1" /> Alergias
                 </span>
                 <p className="text-sm font-medium text-red-100">{profile.allergies}</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* AI Triage Result */}
      <div className="mx-4 space-y-4">
        {request.triage && (
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                <ShieldCheck className="mr-2 text-red-600" />
                Instruções da IA
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full font-bold border ${severityColor[request.triage.severity]}`}>
                PRIORIDADE {request.triage.severity}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-3">
              <p className="text-blue-900 text-sm font-medium leading-relaxed">
                "{request.triage.advice}"
              </p>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center">
              <Activity size={12} className="mr-1" />
              Triagem preliminar: {request.triage.department}
            </p>
          </div>
        )}

        {/* Generic Safety Info */}
        <div className="bg-white rounded-xl shadow-sm p-4">
           <h4 className="font-semibold text-sm mb-2 text-gray-700">Enquanto espera:</h4>
           <ul className="text-sm text-gray-600 space-y-2">
             <li className="flex items-start">
               <span className="mr-2">•</span>
               Mantenha o telefone livre para contato da equipe.
             </li>
             <li className="flex items-start">
               <span className="mr-2">•</span>
               Se possível, peça para alguém aguardar na entrada.
             </li>
             <li className="flex items-start">
               <span className="mr-2">•</span>
               Se o quadro piorar, ligue 192 imediatamente.
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
};