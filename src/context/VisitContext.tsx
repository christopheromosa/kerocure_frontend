"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
interface TriageData {
  triage_id: number;
  vital_signs: Record<string, never>; // JSONField, assuming key-value pairs
  recorded_by: number | null;
  recorded_at: string;
}
interface ConsultationData {
  note_id: number;
  diagnosis: string;
  prescription: { medication: string; dosage: string }[];
  lab_test_ordered: { test_name: string }[];
  physician: number | null;
  recorded_at: string;
}
interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
  dob: Date;
  contact_number: string;
}
interface LabData {
  result: string[];
  total_cost: number;
}

interface PharmacyData {
  medication_id: number;
  cost: number;
}

interface VisitData {
  visit_id: number;
  triage_data: TriageData | null;
  consultation_data: ConsultationData | null;
  patient_data: PatientData | null;
  lab_data: LabData | null;
  pharmacy_data: PharmacyData | null;
}
interface VisitContextType {
  visitData: VisitData | null;
  fetchVisitData: (patientId: string) => Promise<void>;
  loading: boolean;
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
  const [loading, setLoading] = useState<boolean>(false);
  const { authState } = useAuth();
  console.log(authState.token);

  // Function to fetch visit ID based on patient ID
  const fetchVisitData = useCallback(
    async (patientId: string) => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visit/today/${Number(
            patientId
          )}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch visit data");

        const data: VisitData = await response.json();

        console.log("patientId: " + patientId + "data: ", data);
        setVisitData(data);
      } catch (error) {
        console.error("Error fetching visit data:", error);
        setVisitData(null);
      } finally {
        setLoading(false); // Set loading to false when fetching is done (success or error)
      }
    },
    [authState?.token]
  ); // Dependencies for `useCallback`

  console.log(visitData);
  return (
    <VisitContext.Provider value={{ visitData, fetchVisitData, loading }}>
      {children}
    </VisitContext.Provider>
  );
};
