"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";

const BillingDetailsPage = () => {
  const params = useParams();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const { fetchVisitData, visitData } = useVisit();
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [labCost, setLabCost] = useState<number>(0);
  const [pharmacyCost, setPharmacyCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Fetch consultation fee from the server
  const fetchConsultationFee = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/consultation-fee/${visitData?.visit_id}`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await res.json();
      setConsultationFee(data.fee);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching consultation fee:", error);
    }
  };

  // Fetch lab cost from the server
  const fetchLabCost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/lab-cost/${visitData?.visit_id}`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await res.json();
      setLabCost(data.cost);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching lab cost:", error);
    }
  };

  // Fetch pharmacy cost from the server
  const fetchPharmacyCost = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/pharmacy-cost/${visitData?.visit_id}`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await res.json();
      setPharmacyCost(data.cost);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching pharmacy cost:", error);
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const total = consultationFee + labCost + pharmacyCost;
    setTotalCost(total);
  };

  // Save billing details
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
          labCost,
          pharmacyCost,
          totalCost,
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

  // Print receipt
  const handlePrintReceipt = () => {
    const receiptContent = `
      <h1>Receipt</h1>
      <p>Patient Name: ${visitData?.patient_data?.first_name} ${
      visitData?.patient_data?.last_name
    }</p>
      <p>Consultation Fee: $${consultationFee.toFixed(2)}</p>
      <p>Lab Cost: $${labCost.toFixed(2)}</p>
      <p>Pharmacy Cost: $${pharmacyCost.toFixed(2)}</p>
      <p>Total Cost: $${totalCost.toFixed(2)}</p>
    `;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Billing Details for {visitData?.patient_data?.first_name}{" "}
              {visitData?.patient_data?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Consultation Fee */}
            <div className="mb-4">
              <p className="font-medium">Consultation Fee:</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={consultationFee}
                  readOnly
                  placeholder="Consultation fee"
                />
                <Button onClick={fetchConsultationFee}>
                  Generate Consultation Fee
                </Button>
              </div>
            </div>

            {/* Lab Cost */}
            <div className="mb-4">
              <p className="font-medium">Lab Cost:</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={labCost}
                  readOnly
                  placeholder="Lab cost"
                />
                <Button onClick={fetchLabCost}>Generate Lab Cost</Button>
              </div>
            </div>

            {/* Pharmacy Cost */}
            <div className="mb-4">
              <p className="font-medium">Pharmacy Cost:</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={pharmacyCost}
                  readOnly
                  placeholder="Pharmacy cost"
                />
                <Button onClick={fetchPharmacyCost}>
                  Generate Pharmacy Cost
                </Button>
              </div>
            </div>

            {/* Calculate Total Button */}
            <Button className="mt-4" onClick={calculateTotalCost}>
              Generate Total Cost
            </Button>

            {/* Total Cost */}
            <div className="mt-4">
              <p className="font-medium">Total Cost: ${totalCost.toFixed(2)}</p>
            </div>

            {/* Save Billing Button */}
            <Button className="mt-4" onClick={handleSaveBilling}>
              Save Billing Details
            </Button>

            {/* Print Receipt Button */}
            <Button className="mt-4 ml-2" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </CardContent>
        </Card>

        {/* Success Alert Dialog */}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
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
    </PageTransition>
  );
};

export default BillingDetailsPage;
