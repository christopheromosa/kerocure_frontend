"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import axios from "axios";
import { useRouter } from "next/navigation";

// Define the type for a prescription
interface Prescription {
  id: number;
  medication_name: string;
  quantity: string;
  cost: number;
  dispensed: boolean;
}

// Define the type for a drug
interface Drug {
  id: number;
  drug_name: string;
  cost: number;
  quantity: number;
  status: string;
}

const PharmacyDetailsPage = () => {
  const params = useParams();
  const { visitData, fetchVisitData } = useVisit();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensedDrugs, setDispensedDrugs] = useState<Prescription[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState<boolean>(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [drugs, setDrugs] = useState<Drug[]>([]); // Store all drugs here
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [dispenseQuantity, setDispenseQuantity] = useState<number>(1);

  // Fetch patient details and prescriptions on page load
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Fetch all drugs on page load
  useEffect(() => {
    const fetchAllDrugs = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/drugs/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setDrugs(response.data); // Store all drugs in state
      } catch (error) {
        console.error("Error fetching drugs:", error);
      }
    };

    fetchAllDrugs();
  }, [authState?.token]);

  // Initialize prescriptions state
  useEffect(() => {
    if (visitData?.consultation_data?.prescription) {
      const initialPrescriptions = visitData.consultation_data.prescription.map(
        (prescription, index) => ({
          id: index,
          medication_name: prescription.drug_name,
          quantity: prescription.quantity,
          cost: prescription.cost,
          dispensed: false,
        })
      );
      setPrescriptions(initialPrescriptions);
    }
  }, [visitData]);

  // Filter drugs locally based on search query
  const filteredDrugs = searchQuery.trim()? drugs.filter((drug) =>
    drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
  ):[];

  // Open dispense dialog
  const openDispenseDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDispenseDialog(true);
  };

  // Handle drug selection
  const handleDrugSelection = (drug: Drug) => {
    setSelectedDrug(drug);
    setDispenseQuantity(1); // Reset quantity to 1
  };

  // Handle quantity adjustment
  const adjustQuantity = (amount: number) => {
    if (
      selectedDrug &&
      dispenseQuantity + amount > 0 &&
      dispenseQuantity + amount <= selectedDrug.quantity
    ) {
      setDispenseQuantity(dispenseQuantity + amount);
    }
  };

  // Complete dispensing
const handleCompleteDispensing = async () => {
  if (selectedDrug && selectedPrescription) {
    try {
      // Calculate total cost
      const totalCost = selectedDrug.cost * dispenseQuantity;

      // Deduct the dispensed quantity from the drug's quantity in the database
      const updatedQuantity = selectedDrug.quantity - dispenseQuantity;

      // Update the drug in the database
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/drugs/${selectedDrug.id}/`,
        {
          ...selectedDrug,
          quantity: updatedQuantity,
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the local drugs state
        setDrugs((prev) =>
          prev.map((drug) =>
            drug.id === selectedDrug.id
              ? { ...drug, quantity: updatedQuantity }
              : drug
          )
        );

        // Add the dispensed drug to the dispensedDrugs list
        const dispensedDrug = {
          ...selectedPrescription,
          medication_name: selectedDrug.drug_name,
          quantity: dispenseQuantity.toString(),
          cost: totalCost,
          dispensed: true,
        };
        setDispensedDrugs((prev) => [...prev, dispensedDrug]);

        // Close the dispense dialog
        setShowDispenseDialog(false);
      } else {
        throw new Error("Failed to update drug quantity");
      }
    } catch (error) {
      console.error("Error updating drug quantity:", error);
      toast.error("Failed to update drug quantity. Please try again.");
    }
  }
};

  // Function to calculate total cost
  const calculateTotalCost = () => {
    return dispensedDrugs.reduce((total, drug) => total + drug.cost, 0);
  };

  // Function to save prescription details
  const handleSavePrescription = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/`,
        {
          visit: visitData?.visit_id,
          note: visitData?.consultation_data?.note_id,
          prescriptions: dispensedDrugs,
          cost: calculateTotalCost(),
          dispensed_by: authState?.user_id,
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      if (res.status === 201) {
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
        toast.success("Prescriptions saved successfully", {
          autoClose: 1000,
          onClose: () => {
            router.push("/departments/pharmacy");
                      },
        });
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
                <TableHead>Actions</TableHead>
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
                      disabled
                      placeholder="Enter cost"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => openDispenseDialog(prescription)}>
                      Dispense
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <p className="font-medium">
              Total Cost: Ksh {calculateTotalCost().toFixed(2)}
            </p>
          </div>
          <Button className="mt-4" onClick={handleSavePrescription}>
            Save Prescription Details
          </Button>
        </CardContent>
      </Card>

      {/* Dispense Dialog */}
      <AlertDialog
        open={showDispenseDialog}
        onOpenChange={setShowDispenseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dispense Drug</AlertDialogTitle>
            <AlertDialogDescription>
              Search for the drug and adjust the quantity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search for a drug"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filteredDrugs.map((drug) => (
              <div
                key={drug.id}
                className="p-2 border rounded cursor-pointer"
                onClick={() => handleDrugSelection(drug)}
              >
                <p>{drug.drug_name}</p>
                <p>Cost: Ksh {drug.cost}</p>
                <p>Quantity: {drug.quantity}</p>
                <p>Status: {drug.status}</p>
              </div>
            ))}
            {selectedDrug && (
              <div className="space-y-2">
                <p>Selected Drug: {selectedDrug.drug_name}</p>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => adjustQuantity(-1)}>-</Button>
                  <Input type="number" value={dispenseQuantity} readOnly />
                  <Button onClick={() => adjustQuantity(1)}>+</Button>
                </div>
                <p>
                  Total Cost: Ksh{" "}
                  {(selectedDrug.cost * dispenseQuantity).toFixed(2)}
                </p>
                <Button onClick={handleCompleteDispensing}>Complete</Button>
              </div>
            )}
          </div>
          <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            
        </AlertDialogContent>
      </AlertDialog>

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
      <ToastContainer />
    </div>
  );
};

export default PharmacyDetailsPage;
