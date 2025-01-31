// app/billing/[bill_id]/page.tsx
"use client";
import React, { useState } from "react";
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

// Mock data for demonstration
const mockPatients = [
  {
    id: 1,
    name: "John Doe",
    consultationFee: 50,
    labTests: [
      { id: 1, testName: "Blood Test", cost: 25 },
      { id: 2, testName: "X-Ray", cost: 50 },
    ],
    pharmacy: [
      { id: 1, medication: "Paracetamol", cost: 10 },
      { id: 2, medication: "Ibuprofen", cost: 15 },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    consultationFee: 50,
    labTests: [
      { id: 3, testName: "Urine Test", cost: 15 },
      { id: 4, testName: "MRI", cost: 100 },
    ],
    pharmacy: [
      { id: 3, medication: "Amoxicillin", cost: 20 },
      { id: 4, medication: "Cetirizine", cost: 5 },
    ],
  },
];

const BillingDetailsPage = () => {
  const params = useParams();
  const billId = params.bill_id as string;
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Find the selected patient
  const selectedPatient = mockPatients.find(
    (patient) => patient.id === parseInt(billId)
  );

  // State for billing details
  const [consultationFee, setConsultationFee] = useState<number>(
    selectedPatient?.consultationFee || 0
  );
  const [labTests, setLabTests] = useState(selectedPatient?.labTests || []);
  const [pharmacy, setPharmacy] = useState(selectedPatient?.pharmacy || []);

  // Function to calculate total cost
  const calculateTotalCost = () => {
    const labTotal = labTests.reduce((total, test) => total + test.cost, 0);
    const pharmacyTotal = pharmacy.reduce((total, med) => total + med.cost, 0);
    return consultationFee + labTotal + pharmacyTotal;
  };

  // Function to save billing details
  const handleSaveBilling = async () => {
    try {
      // Simulate API call to save billing details
      console.log("Saving billing details for patient:", {
        consultationFee,
        labTests,
        pharmacy,
        totalCost: calculateTotalCost(),
      });
      // await axios.post("/api/save-billing", { ... });
      setShowSuccessDialog(true); // Show success dialog
    } catch (error) {
      console.error("Failed to save billing details:", error);
      setShowErrorDialog(true); // Show error dialog
    }
  };

  if (!selectedPatient) {
    return <div className="p-6">Patient not found.</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing Details for {selectedPatient.name}</CardTitle>
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
                    <TableCell>{test.testName}</TableCell>
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
                    <TableCell>{med.medication}</TableCell>
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
            <p className="font-medium">Total Cost: ${calculateTotalCost()}</p>
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
