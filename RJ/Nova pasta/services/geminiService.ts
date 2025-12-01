import { GoogleGenAI, Type } from "@google/genai";
import { EmergencySeverity, TriageResult, PatientProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSymptoms = async (
  symptoms: string, 
  conscious: boolean,
  profile?: PatientProfile
): Promise<TriageResult> => {
  try {
    const medicalContext = profile 
      ? `Histórico Médico Conhecido: ${profile.medicalConditions || 'Nenhum'}. Alergias: ${profile.allergies || 'Nenhuma'}. Idade/Nascimento: ${profile.dateOfBirth}.` 
      : "Sem histórico médico disponível.";

    const prompt = `
      Atue como um sistema de triagem médica de emergência. 
      A vítima está ${conscious ? 'consciente' : 'INCONSCIENTE'}.
      Sintomas relatados: "${symptoms}".
      Contexto adicional do paciente: ${medicalContext}
      
      Considere o histórico médico e alergias na avaliação de gravidade se relevante.
      Classifique a gravidade, forneça conselhos imediatos de primeiros socorros (curtos e diretos) e o departamento médico provável.
      Responda estritamente no formato JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ["ALTA", "MÉDIA", "BAIXA"],
              description: "Gravidade da emergência baseada nos sintomas e histórico."
            },
            advice: {
              type: Type.STRING,
              description: "Instruções curtas de primeiros socorros. Mencione precauções com alergias/condições se aplicável."
            },
            department: {
              type: Type.STRING,
              description: "Especialidade médica sugerida (ex: Cardiologia, Ortopedia, Trauma)."
            }
          },
          required: ["severity", "advice", "department"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    const data = JSON.parse(text);

    // Map string response to Enum safely
    let severityEnum = EmergencySeverity.UNKNOWN;
    switch (data.severity) {
      case "ALTA": severityEnum = EmergencySeverity.HIGH; break;
      case "MÉDIA": severityEnum = EmergencySeverity.MEDIUM; break;
      case "BAIXA": severityEnum = EmergencySeverity.LOW; break;
    }

    return {
      severity: severityEnum,
      advice: data.advice,
      department: data.department
    };

  } catch (error) {
    console.error("Erro na triagem com IA:", error);
    // Fallback in case of AI failure
    return {
      severity: EmergencySeverity.HIGH, // Assume worst case on error
      advice: "Mantenha a calma e aguarde o socorro. Não mova a vítima se houver suspeita de trauma.",
      department: "Emergência Geral"
    };
  }
};