"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

// Define the type for a prescription
interface Prescription {
  id: number;
  drug_name: string;
  quantity: string;
  prescribed_quantity: string;
  cost: number;
  dispensed: boolean;
  dosage: string;
  route: string;
  strength: string;
  frequency: string;
  duration: string;
}

const PharmacyDetailsPage = () => {
  const params = useParams();
  const { visitData, fetchVisitData } = useVisit();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensedDrugs, setDispensedDrugs] = useState<Prescription[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch patient details and prescriptions on page load
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Initialize prescriptions state
  useEffect(() => {
    if (visitData?.consultation_data?.prescription) {
      const initialPrescriptions = visitData.consultation_data.prescription.map(
        (prescription) => ({
          id: prescription.id,
          drug_name: prescription.drug_name,
          quantity: prescription.quantity,
          prescribed_quantity: prescription.prescribed_quantity,
          cost: prescription.cost,
          dosage: prescription.dosage,
          route: prescription.route,
          strength: prescription.strength,
          frequency: prescription.frequency,
          duration: prescription.duration,
          dispensed: false,
        })
      );
      setPrescriptions(initialPrescriptions);
    }
  }, [visitData]);

  // Function to display only non-empty prescription fields
  const renderPrescriptionField = (label: string, value: string) => {
    if (!value || value.trim() === "") return null;
    return (
      <div className="flex items-center gap-2">
        <Label className="font-medium">{label}:</Label>
        <span>{value}</span>
      </div>
    );
  };

  // Simplified dispensing function
  const handleDispense = async (prescription: Prescription) => {
    try {
      // Calculate total cost for this prescription
      const totalCost =
        prescription.cost * parseInt(prescription.prescribed_quantity);

      // Mark as dispensed in local state
      const updatedPrescriptions = prescriptions.map((p) =>
        p.id === prescription.id ? { ...p, dispensed: true } : p
      );

      setPrescriptions(updatedPrescriptions);

      // Add to dispensed drugs
      const dispensedDrug = {
        ...prescription, // Spread all original properties
        dispensed: true,
        // Explicitly maintain quantity fields
        quantity: prescription.prescribed_quantity, // Use prescribed quantity as dispensed quantity
        prescribed_quantity: prescription.prescribed_quantity, // Preserve original
      };
      setDispensedDrugs((prev) => [...prev, dispensedDrug]);

      // Make API calls
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/dispense-drug/`,
        {
          drug_id: prescription.id,
          quantity_dispensed: parseInt(prescription.prescribed_quantity),
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/drug-sales/`,
        {
          drug: prescription.id,
          quantity_sold: prescription.prescribed_quantity,
          total_amount: totalCost,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      toast.success(`${prescription.drug_name} dispensed successfully`);
    } catch (error) {
      console.error("Error dispensing drug:", error);
      toast.error(`Failed to dispense ${prescription.drug_name}`);
      // Revert local state if API call fails
      const revertedPrescriptions = prescriptions.map((p) =>
        p.id === prescription.id ? { ...p, dispensed: false } : p
      );
      setPrescriptions(revertedPrescriptions);
    }
  };

  // Function to calculate total cost
  const calculateTotalCost = () => {
    return dispensedDrugs.reduce((total, drug) => {
      return total + drug.cost * parseInt(drug.prescribed_quantity);
    }, 0);
  };

  // Simplified save function
  const handleSavePrescription = async () => {
    setIsSaving(true);
    try {
      const totalCost = calculateTotalCost();

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/`,
        {
          visit: visitData?.visit_id,
          note: visitData?.consultation_data?.note_id,
          prescriptions: dispensedDrugs.map((drug) => ({
            drug_id: drug.id, // Map 'id' to 'drug_id' if backend expects it
            drug_name: drug.drug_name,
            quantity: drug.prescribed_quantity, // Ensure prescribed quantity is used
            prescribed_quantity: drug.prescribed_quantity,
            cost: drug.cost * parseInt(drug.prescribed_quantity),
            dosage: drug.dosage,
            route: drug.route,
            strength: drug.strength,
            frequency: drug.frequency,
            duration: drug.duration,
            dispensed: true,
          })),
          cost: totalCost,
          dispensed_by: authState?.user_id,
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      // Update visit state
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
        {
          patient: patientId,
          current_state: "PHARMACY",
          next_state: "BILLING",
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      toast.success("Prescriptions saved successfully");
      router.push("/departments/pharmacy");
    } catch (error) {
      console.error("Error saving prescription details:", error);
      toast.error("Failed to save prescriptions");
    } finally {
      setIsSaving(false);
    }
  };

  if (!patientId) {
    return <div className="p-6">Loading patient details...</div>;
  }
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-2">
            <div>
              Prescriptions for {visitData?.patient_data?.first_name}{" "}
              {visitData?.patient_data?.last_name}
            </div>
            <div className="flex items-center justify-between gap-2">
              {visitData?.consultation_data?.prescription_paid_status ? (
                <>
                  <Label className="font-medium">Payment Status:</Label>
                  <Badge className="bg-green-500 text-white">Paid</Badge>
                </>
              ) : (
                <>
                  <Label className="font-medium">Payment Status:</Label>
                  <Badge className="bg-red-500 text-white">Pending</Badge>
                </>
              )}
              <Button onClick={handleRefresh}>Refresh Page</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">
                      {prescription.drug_name}
                    </h3>
                    {renderPrescriptionField("Dosage", prescription.dosage)}
                    {renderPrescriptionField("Route", prescription.route)}
                    {renderPrescriptionField("Strength", prescription.strength)}
                  </div>
                  <div className="space-y-2">
                    {renderPrescriptionField(
                      "Frequency",
                      prescription.frequency
                    )}
                    {renderPrescriptionField("Duration", prescription.duration)}
                    {renderPrescriptionField(
                      "Quantity",
                      prescription.prescribed_quantity
                    )}
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Cost:</Label>
                      <span>
                        Ksh{" "}
                        {(
                          prescription.cost *
                          parseInt(prescription.prescribed_quantity)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  {prescription.dispensed ? (
                    <Button variant="outline" disabled>
                      Dispensed
                    </Button>
                  ) : (
                    <Button onClick={() => handleDispense(prescription)}>
                      Dispense
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="font-bold text-lg">Total Cost:</Label>
              <span className="font-bold text-lg">
                Ksh {calculateTotalCost().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSavePrescription}
              disabled={isSaving || dispensedDrugs.length === 0}
            >
              {isSaving ? "Saving..." : "Save Prescription Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default PharmacyDetailsPage;
