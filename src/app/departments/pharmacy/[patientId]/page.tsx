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
import { useVisit } from "@/context/VisitContext";
import axios from "axios";

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
  const { visitData, fetchVisitData } = useVisit();
  const patientId = params.patient_id as string;
  const { authState } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Fetch patient details and prescriptions on page load
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

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
          cost: calculateTotalCost(),
        }),
      });

      if (res.ok) {
      await axios.put(
        `http://localhost:8000/visits/${visitData?.visit_id}/`,
        {
          patient: patientId,
          current_state: "PHARMACY",
          next_state: "BILLING",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );


        setShowSuccessDialog(true);
      } else {
        throw new Error("Failed to save prescription details");
      }
    } catch (error) {
      console.error("Error saving prescription details:", error);
      setShowErrorDialog(true);
    }
  };

  if (!patientId) {
    return <div className="p-6">Loading patient details...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Prescriptions for {visitData?.patient_data?.first_name}{" "}
            {visitData?.patient_data?.last_name}
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
              {visitData?.consultation_data?.prescription.map(
                (prescription) => (
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
                )
              )}
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
