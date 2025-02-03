"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { PatientType } from "@/components/tables/triage-data-table/columns";

// Define the type for a prescription
interface Prescription {
  id: number;
  medication_name: string;
  quantity: number;
  cost: number;
  dispensed: boolean;
}

const PharmacyDetailsPage = () => {
  const params = useParams();
  const patientId = params.patient_id as string;
  const { authState } = useAuth();
  const [patient, setPatient] = useState<PatientType>();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Fetch patient details and prescriptions on page load
  useEffect(() => {
    const fetchPatientAndPrescriptions = async () => {
      try {
        // Fetch patient details
        const patientRes = await fetch(
          `http://localhost:8000/patients/${patientId}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!patientRes.ok) {
          throw new Error("Failed to fetch patient details");
        }

        const patientData = await patientRes.json();
        setPatient(patientData);

        // Fetch prescriptions for the patient's visit
        const visitRes = await fetch(
          `http://localhost:8000/consultation/${patientData.visit_id}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!visitRes.ok) {
          throw new Error("Failed to fetch prescriptions");
        }

        const visitData = await visitRes.json();
        setPrescriptions(visitData.prescriptions || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowErrorDialog(true);
      }
    };

    fetchPatientAndPrescriptions();
  }, [patientId, authState?.token]);

  // Function to calculate total cost
  const calculateTotalCost = () => {
    return prescriptions
      .filter((prescription) => prescription.dispensed)
      .reduce((total, prescription) => total + prescription.cost, 0);
  };

  // Function to save prescription details
  const handleSavePrescription = async () => {
    try {
      const res = await fetch("http://localhost:8000/pharmacy/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          prescriptions,
          totalCost: calculateTotalCost(),
        }),
      });

      if (res.ok) {
        setShowSuccessDialog(true);
      } else {
        throw new Error("Failed to save prescription details");
      }
    } catch (error) {
      console.error("Error saving prescription details:", error);
      setShowErrorDialog(true);
    }
  };

  if (!patient) {
    return <div className="p-6">Loading patient details...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Prescriptions for {patient.first_name} {patient.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Dispensed</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.medication_name}</TableCell>
                  <TableCell>{prescription.quantity}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={prescription.dispensed}
                      onCheckedChange={(checked) =>
                        setPrescriptions((prev) =>
                          prev.map((p) =>
                            p.id === prescription.id
                              ? { ...p, dispensed: checked as boolean }
                              : p
                          )
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={prescription.cost}
                      onChange={(e) =>
                        setPrescriptions((prev) =>
                          prev.map((p) =>
                            p.id === prescription.id
                              ? { ...p, cost: parseFloat(e.target.value) }
                              : p
                          )
                        )
                      }
                      placeholder="Enter cost"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <p className="font-medium">
              Total Cost: ${calculateTotalCost().toFixed(2)}
            </p>
          </div>
          <Button className="mt-4" onClick={handleSavePrescription}>
            Save Prescription Details
          </Button>
        </CardContent>
      </Card>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Prescription details saved successfully!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Alert Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              Failed to save prescription details. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PharmacyDetailsPage;
