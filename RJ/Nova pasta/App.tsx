import React, { useState, useEffect } from 'react';
import { EmergencyButton } from './components/EmergencyButton';
import { TriageForm } from './components/TriageForm';
import { TrackingView } from './components/TrackingView';
import { ProfileEditor } from './components/ProfileEditor';
import { HistoryView } from './components/HistoryView';
import { RoleSelection } from './components/RoleSelection';
import { ResponderDashboard } from './components/ResponderDashboard';
import { AppStep, Coordinates, RescueRequest, TriageResult, PatientProfile, UserRole } from './types';
import { analyzeSymptoms } from './services/geminiService';
import { MapPinOff, UserCircle, History } from 'lucide-react';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [step, setStep] = useState<AppStep>('HOME');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [request, setRequest] = useState<RescueRequest | null>(null);
  const [userProfile, setUserProfile] = useState<PatientProfile | null>(null);
  const [requestHistory, setRequestHistory] = useState<RescueRequest[]>([]);

  // Initialize Geolocation, Load Profile and History on mount
  useEffect(() => {
    // Only init geolocator if user is a patient (or hasn't selected yet, but strictly needed for patient)
    if (userRole === 'RESPONDER') return;

    // Geolocation
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não suportada neste dispositivo.");
    } else {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          let msg = "Erro ao obter localização.";
          
          if (error.code === 1) {
            msg = "Permissão de localização negada. Verifique as configurações.";
          } else if (error.code === 2) {
            msg = "Sinal de GPS indisponível ou fraco.";
          } else if (error.code === 3) {
            msg = "O tempo limite para obter a localização expirou.";
          } else if (error.message) {
             msg = `Erro de GPS: ${error.message}`;
          }

          setLocationError(msg);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // Load Profile
    const savedProfile = localStorage.getItem('resgateja_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }

    // Load History
    const savedHistory = localStorage.getItem('resgateja_history');
    if (savedHistory) {
      try {
        setRequestHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Check for existing active request to restore state
    const activeReq = localStorage.getItem('resgateja_active_request');
    if (activeReq) {
      try {
         const parsedReq = JSON.parse(activeReq);
         if (parsedReq.status !== 'COMPLETED') {
            setRequest(parsedReq);
            setStep('TRACKING');
         }
      } catch(e) {}
    }
  }, [userRole]);

  // Polling for updates when in Tracking Mode (to see if Responder updated status)
  useEffect(() => {
    if (step === 'TRACKING' && request) {
      const interval = setInterval(() => {
        const stored = localStorage.getItem('resgateja_active_request');
        if (stored) {
           const parsed = JSON.parse(stored);
           // If status changed in storage (by responder), update local view
           if (parsed.id === request.id && parsed.status !== request.status) {
              setRequest(parsed);
              
              // Also update it in history
              const newHistory = requestHistory.map(h => h.id === parsed.id ? parsed : h);
              setRequestHistory(newHistory);
              localStorage.setItem('resgateja_history', JSON.stringify(newHistory));

              if (parsed.status === 'COMPLETED') {
                // Optional: Automatically go home or show summary
                // setStep('HOME'); 
                // localStorage.removeItem('resgateja_active_request');
              }
           }
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step, request, requestHistory]);

  const handleSaveProfile = (profile: PatientProfile) => {
    setUserProfile(profile);
    localStorage.setItem('resgateja_profile', JSON.stringify(profile));
    setStep('HOME');
  };

  const handleStartEmergency = () => {
    setStep('TRIAGE');
  };

  const handleTriageSubmit = async (name: string, symptoms: string, conscious: boolean, useProfile: boolean) => {
    setIsProcessing(true);
    
    const profileToUse = useProfile ? (userProfile || undefined) : undefined;
    const triageResult: TriageResult = await analyzeSymptoms(symptoms, conscious, profileToUse);
    
    const newRequest: RescueRequest = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      victim: { 
        name, 
        symptoms, 
        conscious,
        profileData: profileToUse
      },
      location: location,
      triage: triageResult,
      status: 'DISPATCHED',
      etaMinutes: Math.floor(Math.random() * (15 - 5 + 1) + 5),
    };

    setRequest(newRequest);
    
    // Save to shared storage so Responder Dashboard can see it
    localStorage.setItem('resgateja_active_request', JSON.stringify(newRequest));
    
    const updatedHistory = [newRequest, ...requestHistory];
    setRequestHistory(updatedHistory);
    localStorage.setItem('resgateja_history', JSON.stringify(updatedHistory));

    setIsProcessing(false);
    setStep('TRACKING');
  };

  if (!userRole) {
    return <RoleSelection onSelect={setUserRole} />;
  }

  if (userRole === 'RESPONDER') {
    return <ResponderDashboard onLogout={() => setUserRole(null)} />;
  }

  // Patient App Interface
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <nav className="bg-white p-4 shadow-sm z-50 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => step !== 'TRACKING' && setStep('HOME')}>
           <div className="bg-red-600 text-white p-1 rounded font-bold text-sm">RJ</div>
           <span className="font-bold text-gray-800 tracking-tight">ResgateJá</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {step !== 'TRACKING' && (
            <>
              <button 
                onClick={() => setStep('HISTORY')}
                className={`transition p-1 rounded-full ${step === 'HISTORY' ? 'bg-gray-100 text-slate-800' : 'text-gray-400 hover:text-slate-600'}`}
                title="Histórico de Chamadas"
              >
                 <History size={22} />
              </button>
              <button 
                onClick={() => setStep('PROFILE')}
                className={`transition p-1 rounded-full ${step === 'PROFILE' ? 'bg-gray-100 text-slate-800' : 'text-gray-400 hover:text-slate-600'}`}
                title="Meu Perfil Médico"
              >
                 <UserCircle size={24} className={userProfile ? 'text-slate-800' : ''} />
              </button>
            </>
          )}

          <div className="flex items-center text-xs font-medium text-gray-500 border-l pl-3 ml-1">
            {location ? (
               <span className="text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  GPS
               </span>
            ) : (
               <span className="text-red-500 flex items-center">
                 <MapPinOff size={14} className="mr-1"/>
                 Sem GPS
               </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10">
        
        {locationError && step !== 'TRACKING' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mt-4 text-sm" role="alert">
            <p className="font-bold">Atenção</p>
            <p>{locationError}</p>
          </div>
        )}

        {step === 'HOME' && (
          <EmergencyButton onClick={handleStartEmergency} />
        )}

        {step === 'PROFILE' && (
          <div className="animate-slide-up px-4">
             <ProfileEditor 
                initialProfile={userProfile} 
                onSave={handleSaveProfile} 
                onCancel={() => setStep('HOME')} 
             />
          </div>
        )}

        {step === 'HISTORY' && (
          <HistoryView 
            history={requestHistory}
            onBack={() => setStep('HOME')}
          />
        )}

        {step === 'TRIAGE' && (
          <div className="p-4 animate-slide-up">
            <button 
              onClick={() => setStep('HOME')}
              className="mb-4 text-gray-500 text-sm hover:text-gray-800"
            >
              ← Voltar
            </button>
            <TriageForm 
              onSubmit={handleTriageSubmit} 
              isProcessing={isProcessing} 
              userProfile={userProfile}
            />
          </div>
        )}

        {step === 'TRACKING' && request && (
          <div className="animate-fade-in">
             <TrackingView request={request} />
             {request.status === 'COMPLETED' && (
                 <button 
                    onClick={() => {
                        setStep('HOME');
                        localStorage.removeItem('resgateja_active_request');
                    }}
                    className="mx-auto block mt-8 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold"
                 >
                    Voltar ao Início
                 </button>
             )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-400 text-xs mt-auto">
        <p>© 2024 ResgateJá - Sistema de Emergência</p>
        <button onClick={() => setUserRole(null)} className="mt-2 text-red-300 underline">
            Sair / Trocar Perfil
        </button>
      </footer>
    </div>
  );
};

export default App;