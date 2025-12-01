import React from 'react';
import { RescueRequest, EmergencySeverity } from '../types';
import { Clock, Calendar, AlertCircle, CheckCircle2, MapPin, ArrowLeft } from 'lucide-react';

interface Props {
  history: RescueRequest[];
  onBack: () => void;
}

export const HistoryView: React.FC<Props> = ({ history, onBack }) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DISPATCHED': return { label: 'Enviada', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'ARRIVED': return { label: 'Chegou', color: 'bg-blue-100 text-blue-800', icon: MapPin };
      case 'COMPLETED': return { label: 'Finalizada', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
      default: return { label: 'Pendente', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const getSeverityColor = (severity?: EmergencySeverity) => {
    switch (severity) {
      case EmergencySeverity.HIGH: return 'border-l-4 border-red-500';
      case EmergencySeverity.MEDIUM: return 'border-l-4 border-yellow-500';
      case EmergencySeverity.LOW: return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-20 animate-slide-up">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Clock className="mr-2 text-slate-700" />
          Histórico de Chamadas
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum registro</h3>
          <p className="text-gray-500 mt-1">Você ainda não realizou chamadas de emergência.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div 
                key={request.id} 
                className={`bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow ${getSeverityColor(request.triage?.severity)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center text-xs font-medium text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(request.timestamp)}
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                    <StatusIcon size={12} className="mr-1" />
                    {statusInfo.label}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {request.victim.conscious ? 'Consciente' : 'INCONSCIENTE'} 
                    {request.victim.name ? ` • ${request.victim.name}` : ''}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 italic">
                    "{request.victim.symptoms}"
                  </p>
                </div>

                {request.triage && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {request.triage.department}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Prioridade {request.triage.severity}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};