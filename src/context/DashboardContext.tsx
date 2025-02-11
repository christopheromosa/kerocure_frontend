"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useQuery } from "react-query";
import LoadingPage from "@/components/loading_animation";

type Billing = {
  id: number;
  totalCost: number;
  visit: number;
  billed_by: number;
  consultation_cost:number;
  laboratory_cost:number;
  pharmacy_cost:number;
  total_cost:number;
  recorded_at:string;
};

interface dashboard {
  consultationPatients: number;
  labPatients: number;
  pharmacyPatients: number;
  billingPatients: number;
  billingRecords: Billing[];
  revenues: { date: string; total_cost: number }[];
  totalPatients: number;
}

interface DashboardData {
  data: dashboard | null;
  refetch: () => void;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardData | undefined>(undefined);

const fetchDashboardData = async () => {
  const [
    consultationQueueRes,
    labQueueRes,
    pharmacyQueueRes,
    billingQueueRes,
    billingRecords,
    billingTotalCost,
    patientsAll,
  ] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/triage-patients/`).then(
      (res) => res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultation-patients/`).then(
      (res) => res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pharmacy-patients/`).then(
      (res) => res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing-patients/`).then(
      (res) => res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/`).then((res) =>
      res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/total-revenue-per-day/`).then(
      (res) => res.json()
    ),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/`).then((res) =>
      res.json()
    ),
  ]);

  return {
    consultationPatients: consultationQueueRes?.length ?? 0,
    labPatients: labQueueRes?.length ?? 0,
    pharmacyPatients: pharmacyQueueRes?.length ?? 0,
    billingPatients: billingQueueRes?.length ?? 0,
    billingRecords: billingRecords?.slice(-5) ?? [],
    revenues: billingTotalCost ?? 0,
    totalPatients: patientsAll ?? 0,
  };
};

export const useDashboardData = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useVisit must be used within VisitProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  console.log(authState.token);

  const { data, isLoading, isError, refetch } = useQuery(
    "dashboardData",
    fetchDashboardData,
    {
      staleTime: 3000, // Cache for 5 minutes
      refetchOnWindowFocus: true, // Auto-refetch when user revisits the page
      refetchInterval: 60000, // Refetch every 1 minute (60,000 ms)
    }
  );

  if (isLoading || isError) {
    return <LoadingPage />;
  }

  return (
    <DashboardContext.Provider
      value={{
        data: data ?? null,
        refetch,
        isLoading,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
