"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// Define the type for lab test and pharmacy data
interface LabTest {
  id: number;
  test_name: string;
  cost: number;
}

interface PharmacyMedication {
  id: number;
  medication_name: string;
  cost: number;
}

const BillingDetailsPage = () => {
  const params = useParams();
  const billId = params.bill_id as string;
  const { authState } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [pharmacy, setPharmacy] = useState<PharmacyMedication[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Fetch patient details, consultation fees, lab tests, and pharmacy data on page load
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        // Fetch patient details
        const patientRes = await fetch(
          `http://localhost:8000/patients/${billId}/`,
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

        // Fetch consultation fees
        const consultationRes = await fetch(
          `http://localhost:8000/consultation/${patientData.visit_id}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!consultationRes.ok) {
          throw new Error("Failed to fetch consultation fees");
        }

        const consultationData = await consultationRes.json();
        setConsultationFee(consultationData.fee || 0);

        // Fetch lab tests
        const labRes = await fetch(
          `http://localhost:8000/lab/${patientData.visit_id}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!labRes.ok) {
          throw new Error("Failed to fetch lab tests");
        }

        const labData = await labRes.json();
        setLabTests(labData.tests || []);

        // Fetch pharmacy data
        const pharmacyRes = await fetch(
          `http://localhost:8000/pharmacy/${patientData.visit_id}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!pharmacyRes.ok) {
          throw new Error("Failed to fetch pharmacy data");
        }

        const pharmacyData = await pharmacyRes.json();
        setPharmacy(pharmacyData.medications || []);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        setShowErrorDialog(true);
      }
    };

    fetchBillingData();
  }, [billId, authState?.token]);

  // Function to calculate total cost
  const calculateTotalCost = () => {
    const labTotal = labTests.reduce((total, test) => total + test.cost, 0);
    const pharmacyTotal = pharmacy.reduce((total, med) => total + med.cost, 0);
    return consultationFee + labTotal + pharmacyTotal;
  };

  // Function to save billing details
  const handleSaveBilling = async () => {
    try {
      const res = await fetch("http://localhost:8000/billing/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          consultationFee,
          labTests,
          pharmacy,
          totalCost: calculateTotalCost(),
        }),
      });

      if (res.ok) {
        setShowSuccessDialog(true);
      } else {
        throw new Error("Failed to save billing details");
      }
    } catch (error) {
      console.error("Error saving billing details:", error);
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
          <CardTitle>Billing Details for {patient.first_name} {patient.last_name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Consultation Fee */}
          <div className="mb-4">
            <p className="font-medium">Consultation Fee:</p>
            <Input
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(parseFloat(e.target.value))}
              placeholder="Enter consultation fee"
            />
          </div>

          {/* Lab Tests */}
          <div className="mb-4">
            <p className="font-medium">Lab Tests:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{test.test_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={test.cost}
                        onChange={(e) =>
                          setLabTests((prev) =>
                            prev.map((t) =>
                              t.id === test.id
                                ? { ...t, cost: parseFloat(e.target.value) }
                                : t
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
          </div>

          {/* Pharmacy */}
          <div className="mb-4">
            <p className="font-medium">Pharmacy:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pharmacy.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>{med.medication_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={med.cost}
                        onChange={(e) =>
                          setPharmacy((prev) =>
                            prev.map((m) =>
                              m.id === med.id
                                ? { ...m, cost: parseFloat(e.target.value) }
                                : m
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
          </div>

          {/* Total Cost */}
          <div className="mt-4">
            <p className="font-medium">Total Cost: ${calculateTotalCost().toFixed(2)}</p>
          </div>

          {/* Save Billing Button */}
          <Button className="mt-4" onClick={handleSaveBilling}>
            Save Billing Details
          </Button>
        </CardContent>
      </Card>

      {/* Success Alert Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Billing details saved successfully!
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
              Failed to save billing details. Please try again.
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

export default BillingDetailsPage;