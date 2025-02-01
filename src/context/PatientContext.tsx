"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PatientState {
  patient_id: number | null;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  BMI: number | null;
}

interface PatientContextType {
  patientState: PatientState;
  setPatient: (
    patient_id: number,
    first_name: string,
    last_name: string,
    age: number,
    weight: number,
    height: number,
    BMI: number
  ) => void;
  resetPatient: () => void;
}
const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within an PatientProvider");
  }
};

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patientState, setPatientState] = useState<PatientState>(
    {} as PatientState
  );
  const setPatient = (
    patient_id: number,
    first_name: string,
    last_name: string,
    age: number,
    weight: number,
    height: number,
    BMI: number
  ) => {
    setPatientState({
      patient_id,
      first_name,
      last_name,
      age,
      weight,
      height,
      BMI,
    });
  };
  const resetPatient = () => {
    setPatientState({} as PatientState);
  };
  return (
    <PatientContext.Provider value={{ patientState, setPatient, resetPatient }}>
      {children}
    </PatientContext.Provider>
  );
};
