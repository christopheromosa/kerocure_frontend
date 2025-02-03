"use client";

import { createContext, useContext, useState, ReactNode,useCallback } from "react";
import { useAuth } from "./AuthContext";
interface TriageData {
  triage_id: number;
  vital_signs: Record<string, never>; // JSONField, assuming key-value pairs
  recorded_by: number | null;
  recorded_at: string;
}
interface ConsultationData{
  note_id:number;
  diagnosis:string;
  prescription:Record<string,never>[];
  lab_test_ordered:Record<string,never>[],
  physician:number|null
  recorded_at:string
}
interface PatientData{
  id:number;
  first_name:string;
  last_name:string;
  dob:Date;
  contact_number:string;

}
interface LabData{
test_name:string[];
result_id:number;
result:string[];
}

interface VisitData {
  visit_id: number;
  triage_data: TriageData | null;
  consultation_data:ConsultationData | null;
  patient_data:PatientData | null;
  lab_data:LabData[] | null;
}
interface VisitContextType {
  visitData: VisitData | null;
  loading: boolean;
  fetchVisitData: (patientId: string) => Promise<void>;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export const useVisit = () => {
  const context = useContext(VisitContext);
  if (!context) {
    throw new Error("useVisit must be used within VisitProvider");
  }
  return context;
};

export const VisitProvider = ({ children }: { children: ReactNode }) => {
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();

  // Function to fetch visit ID based on patient ID
  const fetchVisitData = useCallback(
    async (patientId: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/visit/today/${Number(patientId)}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch visit data");

        const data: VisitData = await response.json();
        setVisitData(data);
      } catch (error) {
        console.error("Error fetching visit data:", error);
        setVisitData(null);
      } finally {
        setLoading(false);
      }
    },
    [authState?.token]
  ); // Dependencies for `useCallback`
  return (
    <VisitContext.Provider value={{ visitData, fetchVisitData, loading }}>
      {children}
    </VisitContext.Provider>
  );
};
