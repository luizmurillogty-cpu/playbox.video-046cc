import React, { useState, useEffect } from 'react';
import { User, Heart, AlertTriangle, Phone, Save, Calendar } from 'lucide-react';
import { PatientProfile } from '../types';

interface Props {
  initialProfile: PatientProfile | null;
  onSave: (profile: PatientProfile) => void;
  onCancel: () => void;
}

export const ProfileEditor: React.FC<Props> = ({ initialProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PatientProfile>({
    fullName: '',
    dateOfBirth: '',
    allergies: '',
    medicalConditions: '',
    contact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-4 mb-20">
      <div className="bg-slate-800 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center">
          <User className="mr-3" />
          Ficha Médica
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Esses dados serão compartilhados com os socorristas em caso de emergência.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar size={14} className="mr-1" /> Data de Nascimento
            </label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Medical Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center text-red-600">
            <Heart size={18} className="mr-2" /> Saúde
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condições Pré-existentes</label>
            <textarea
              value={formData.medicalConditions}
              onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none h-20 resize-none"
              placeholder="Ex: Diabetes, Hipertensão, Asma..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center text-orange-600">
              <AlertTriangle size={14} className="mr-1" /> Alergias
            </label>
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              className="w-full px-4 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none"
              placeholder="Ex: Penicilina, Dipirona, Latex..."
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center">
            <Phone size={18} className="mr-2" /> Contato de Emergência
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contato</label>
              <input
                type="text"
                required
                value={formData.contact.name}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, name: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  required
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                  placeholder="(XX) 9..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                <input
                  type="text"
                  required
                  value={formData.contact.relation}
                  onChange={(e) => setFormData({...formData, contact: {...formData.contact, relation: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                  placeholder="Ex: Mãe"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition flex items-center justify-center shadow-lg"
          >
            <Save size={18} className="mr-2" />
            Salvar Perfil
          </button>
        </div>
      </form>
    </div>
  );
};