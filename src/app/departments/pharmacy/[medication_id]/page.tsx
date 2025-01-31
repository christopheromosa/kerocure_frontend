// app/pharmacy/[patient_id]/page.tsx
"use client";
import React, { useState } from "react";
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

// Mock data for demonstration
const mockPatients = [
  {
    id: 1,
    name: "John Doe",
    prescriptions: [
      {
        id: 1,
        medication: "Paracetamol",
        dosage: "500mg",
        available: false,
        cost: 10,
      },
      {
        id: 2,
        medication: "Ibuprofen",
        dosage: "400mg",
        available: true,
        cost: 15,
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    prescriptions: [
      {
        id: 3,
        medication: "Amoxicillin",
        dosage: "500mg",
        available: true,
        cost: 20,
      },
      {
        id: 4,
        medication: "Cetirizine",
        dosage: "10mg",
        available: false,
        cost: 5,
      },
    ],
  },
];

const PharmacyDetailsPage = () => {
  const params = useParams();
  const patientId = params.medication_id as string;
  console.log(patientId);
  
  
  
  
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Find the selected patient
  const selectedPatient = mockPatients.find(
    (patient) => patient.id === parseInt(patientId)
  );

  // State for pharmacy details
  const [prescriptions, setPrescriptions] = useState(
    selectedPatient?.prescriptions || []
  );

  // Function to calculate total cost
  const calculateTotalCost = () => {
    return prescriptions
      .filter((prescription) => prescription.available)
      .reduce((total, prescription) => total + prescription.cost, 0);
  };

  // Function to save prescription details
  const handleSavePrescription = async () => {
    try {
      // Simulate API call to save prescription details
      console.log("Saving prescription details for patient:", {
        prescriptions,
        totalCost: calculateTotalCost(),
      });
      // await axios.post("/api/save-prescription", { ... });
      setShowSuccessDialog(true); // Show success dialog
    } catch (error) {
      console.error("Failed to save prescription details:", error);
      setShowErrorDialog(true); // Show error dialog
    }
  };

  if (!selectedPatient) {
    return <div className="p-6">Patient not found.</div>;
  }

  return (
    <div className="p-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions for {selectedPatient.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={prescription.available}
                      onCheckedChange={(checked) =>
                        setPrescriptions((prev) =>
                          prev.map((p) =>
                            p.id === prescription.id
                              ? { ...p, available: checked as boolean }
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
