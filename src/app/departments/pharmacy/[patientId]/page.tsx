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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";	
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Import Accordion components

// Define the type for a prescription
interface Prescription {
  id: number;
  drug_name: string;
  quantity: string;
  prescribed_quantity:string;
  cost: number;
  dispensed: boolean;
  dosage: string;
  route: string; // New field
  strength: string; // New field
  frequency: string; // New field
  duration: string; // New field
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
  const [dispenseQuantity, setDispenseQuantity] = useState<string>("");
  const [showConfirmationDialog, setShowConfirmationDialog] =
    useState<boolean>(false);

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
          drug_name: prescription.drug_name,
          quantity:prescription.quantity,
          prescribed_quantity: prescription.prescribed_quantity,
          cost: prescription.cost,
          dosage: prescription.dosage,
          route: prescription.route, // New field
          strength: prescription.strength, // New field
          frequency: prescription.frequency, // New field
          duration: prescription.duration, // New field
          dispensed: false,
        })
      );
      setPrescriptions(initialPrescriptions);
    }
  }, [visitData]);

  // Filter drugs locally based on search query
  const filteredDrugs = searchQuery.trim()
    ? drugs.filter((drug) =>
        drug.drug_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Open dispense dialog
  const openDispenseDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDispenseDialog(true);
  };

  // Handle drug selection
  const handleDrugSelection = (drug: Drug) => {
    setSelectedDrug(drug);
    setDispenseQuantity(""); // Reset quantity to 1
  };

const handleQuantityChange = (value: string) => {
  // Allow only numeric input (optional: you can add more validation)
  if (/^\d*$/.test(value)) { // Only allow digits
    setDispenseQuantity(value); // Store as string
  }
};
  // Complete dispensing
const handleCompleteDispensing = async () => {
  if (selectedPrescription && parseInt(dispenseQuantity) !== parseInt(selectedPrescription.prescribed_quantity)) {
    toast.error("Dispense quantity must match the prescribed quantity.");
    return;
  }
  setShowConfirmationDialog(true);
};

  const confirmDispensing = async () => {
    setShowConfirmationDialog(false);
    if (selectedDrug && selectedPrescription) {
      try {
       const quantityDispensed = parseInt(dispenseQuantity);
        // Call the dispense-drug/ endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/dispense-drug/`,
          {
            drug_id: selectedDrug.id,
            quantity_dispensed: quantityDispensed,
          },
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        // Create DrugSale record
         await axios.post(
           `${process.env.NEXT_PUBLIC_API_URL}/drug-sales/`,
           {
             drug: selectedDrug.id,
             quantity_sold: dispenseQuantity,
             total_amount: selectedDrug.cost * parseInt(dispenseQuantity),
           },
           {
             headers: {
               "Content-Type": "application/json",
               Authorization: `Token ${authState?.token}`,
             },
           }
         );

        if (response.status === 200) {
          // Update the local drugs state with the new quantity and status
          const updatedDrug = response.data; // Assuming the backend returns the updated drug
          setDrugs((prev) =>
            prev.map((drug) =>
              drug.id === updatedDrug.id ? updatedDrug : drug
            )
          );

          // Add the dispensed drug to the dispensedDrugs list
          const dispensedDrug = {
            ...selectedPrescription,
            medication_name: selectedDrug.drug_name,
            quantity: dispenseQuantity.toString(),
            cost: selectedDrug.cost * parseInt(dispenseQuantity),
            dispensed: true,
          };
          setDispensedDrugs((prev) => [...prev, dispensedDrug]);

          // Close the dispense dialog
          setShowDispenseDialog(false);
        } else {
          throw new Error("Failed to dispense drug");
        }
      } catch (error) {
        console.error("Error dispensing drug:", error);
        toast.error("Failed to dispense drug. Please try again.");
      }
    }
  };

  // Function to calculate total cost
  const calculateTotalCost = () => {
    return dispensedDrugs.reduce((total, drug) => total + drug.cost, 0);
  };

  // Function to check for existing medication records
  const checkExistingMedication = async (visitId:any) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/check-existing-medication/${visitId}/`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      return response.data; // Returns the existing medication record or a message
    } catch (error:any) {
      if (error.response?.status === 404) {
        // No medication record found
        return null;
      }
      console.error("Error checking existing medication:", error);
      throw error;
    }
  };

  // Function to save prescription details
  const handleSavePrescription = async () => {
    try {
      // Check if a medication record exists for this visit
      const existingMedication = await checkExistingMedication(visitData?.visit_id);

      let updatedPrescriptions = [];
      let updatedTotalCost = calculateTotalCost();

      if (existingMedication) {
        // If a record exists, append the new prescriptions
        updatedPrescriptions = [
          ...existingMedication.prescriptions,
          ...dispensedDrugs,
        ];
        updatedTotalCost += existingMedication.cost; // Add the existing cost to the new total cost

        // Update the existing medication record
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/${existingMedication.medication_id}/`,
          {
            prescriptions: updatedPrescriptions,
            cost: updatedTotalCost,
          },
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      } else {
        // If no record exists, create a new medication record
        updatedPrescriptions = dispensedDrugs;

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/pharmacy/`,
          {
            visit: visitData?.visit_id,
            note: visitData?.consultation_data?.note_id,
            prescriptions: updatedPrescriptions,
            cost: updatedTotalCost,
            dispensed_by: authState?.user_id,
          },
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      }

      // Update the visit state to "BILLING"
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
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error saving prescription details:", error);
      setShowErrorDialog(true);
    }
  };

  // Function to handle "OK" button click in the success dialog
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false); // Close the dialog
    router.push("/departments/pharmacy"); // Redirect to /departments/pharmacy
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
             <div className="mb-4">
              <p className="font-medium">
                Payment Status:{" "}
                {visitData?.consultation_data?.prescription_paid_status ? (
                  <Badge className="bg-green-500 dark:bg-green-500 text-white dark:text-white">Paid</Badge>
                ) : (
                  <Badge className="bg-red-500 dark:bg-red-500 dark:text-white text-white">Pending</Badge>
                )}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Replace Table with Accordion */}
          <Accordion type="single" collapsible>
            {prescriptions.map((prescription) => (
              <AccordionItem key={prescription.id} value={`item-${prescription.id}`}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full">
                    <span>{prescription.drug_name}</span>
                    <span className="text-sm text-gray-500">
                      {prescription.dispensed ? "Dispensed" : "Pending"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Dosage: {prescription.dosage}</p>
                    <p>Route: {prescription.route}</p>
                    <p>Strength: {prescription.strength}</p>
                    <p>Frequency: {prescription.frequency}</p>
                    <p>Duration: {prescription.duration}</p>
                    <p>Prescribed Quantity: {prescription.prescribed_quantity}</p>
                    <p>Cost: Ksh {prescription.cost}</p>
                    <div className="flex items-center space-x-2">
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
                      <label>Dispensed</label>
                    </div>
                    {parseInt(prescription.quantity) < 1 ? (
                      <Button className="bg-gray-500">Out of Stock</Button>
                    ) : (
                      <Button onClick={() => openDispenseDialog(prescription)}>
                        Dispense
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

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
                <Input
                  type="text" // Use text input
                  value={dispenseQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)} // Pass string value
                  min={1}
                  max={selectedDrug.quantity}
                  placeholder="Enter quantity"
                />
                <p>
                  Total Cost: Ksh{" "}
                   {( selectedDrug.cost * (parseInt(dispenseQuantity) || 0) ).toFixed(2)}
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Dispensing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dispense this drug? This action cannot be
              undone and will directly modify the records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDispensing}>
              Confirm
            </AlertDialogAction>
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
            <AlertDialogAction onClick={handleSuccessDialogClose}>
              OK
            </AlertDialogAction>
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
