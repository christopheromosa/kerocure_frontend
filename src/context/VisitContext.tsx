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
interface TransferHistory {
  from_department: string;
  to_department: string;
  reason: string;
  transferred_by: string;
  transferred_at: string;
}
interface ConsultationData {
  note_id: number;
  diagnosis: string;
  prescription: {
    id: number;
    drug_name: string;
    quantity: string;
    prescribed_quantity: string;
    dosage: string;
    route: string; // New field
    strength: string; // New field
    frequency: string; // New field
    duration: string; // New field
    cost: number;
    dispensed: boolean;
  }[];
  lab_test_ordered: {
    service: string;
    duration: string;
    cost: number;
    administered: boolean;
  }[];
  physician: number | null;
  recorded_at: string;
  total_cost: number;
  consultation_paid_status: boolean;
  lab_tests_paid_status: boolean;
  prescription_paid_status: boolean;
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
  visit_status: string; 
  department: string;
  transfer_history: TransferHistory[];
  total_cost: number;
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

  const fetchVisitData = useCallback(
    async (patientId: string) => {
      if (!authState?.token) {
        console.error("No authentication token available");
        return;
      }

      console.log("Fetching visit data for patient:", patientId);
      console.log("Auth Token:", authState?.token);
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visit/today/${Number(
            patientId
          )}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`, // Change to Bearer if needed
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed request: ${response.status}`);
          throw new Error(
            `Failed to fetch visit data (Status: ${response.status})`
          );
        }

        const data: VisitData = await response.json();
        if (Array.isArray(data)) {
          setVisitData(data.length > 0 ? data[0] : null);
        } else {
          setVisitData(data);
        }
      } catch (error) {
        console.error("Error fetching visit data:", error);
        setVisitData(null);
      } finally {
        setLoading(false);
      }
    },
    [authState?.token]
  );

  console.log(visitData);
  return (
    <VisitContext.Provider value={{ visitData, fetchVisitData, loading }}>
      {children}
    </VisitContext.Provider>
  );
};
