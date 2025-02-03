"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface VisitContextType {
  setVisitId: (visitId: number) => void;
  loading: boolean;
  visitId: number;
  fetchVisitId: (patientId: number, token: string) => void;
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
  const [visitId, setVisitId] = useState(0);
  const [loading, setLoading] = useState(false);

  // Function to fetch visit ID based on patient ID
  const fetchVisitId = async (patientId: number, token: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/visits/?patient=${patientId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (res.ok) {
        const visits = await res.json();
        if (visits.length > 0) {
          setVisitId(visits[0].visit_id);
        } else {
          setVisitId(0);
        }
      } else {
        console.error("Failed to fetch visit ID");
        setVisitId(0);
      }
    } catch (error) {
      console.error("Error fetching visit ID:", error);
      setVisitId(0);
    } finally {
      setLoading(false);
    }
  };
  return (
    <VisitContext.Provider
      value={{ visitId, fetchVisitId, loading, setVisitId }}
    >
      {children}
    </VisitContext.Provider>
  );
};
