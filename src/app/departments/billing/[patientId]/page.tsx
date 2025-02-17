"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";
import axios from "axios";

const BillingDetailsPage = () => {
  const params = useParams();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const router = useRouter();
  const { fetchVisitData, visitData } = useVisit();
  const [consultationFee, setConsultationFee] = useState<string>("");
  // const [labCost, setLabCost] = useState<number>(0);
  // const [pharmacyCost, setPharmacyCost] = useState<number>(0);
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

  // Calculate total cost
  const calculateTotalCost = () => {
    const labCost = visitData?.lab_data?.total_cost || 0;
    const pharmacyCost = visitData?.pharmacy_data?.cost || 0;
    const total = Number(consultationFee) + labCost + pharmacyCost;
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
          consultation_cost: consultationFee,
          laboratory_cost: visitData?.lab_data?.total_cost,
          pharmacy_cost: visitData?.pharmacy_data?.cost,
          total_cost: totalCost,
          visit: visitData?.visit_id,
          billed_by: authState?.user_id,
        }),
      });

      if (res.ok) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
          {
            patient: patientId,
            current_state: "BILLING",
            next_state: "COMPLETED",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        setShowSuccessDialog(true);
        setTimeout(() => {
          toast.success("saved billing details successfully!", {
            autoClose: 1000, // Show toast for 2 seconds
          });
        }, 1000);
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
      <h1>KEROCURE MEDICAL CENTER</h1>
      <h1>Receipt</h1>
      <p>Patient Name:  ${visitData?.patient_data?.first_name} ${
      visitData?.patient_data?.last_name
    } </p>

      <p>Consultation Fee: Ksh ${Number(consultationFee).toFixed(2)}</p>
      <p>Lab Cost: ksh ${visitData?.lab_data?.total_cost.toFixed(2) || 0.0}</p>
      <p>Pharmacy Cost: Ksh ${
        visitData?.pharmacy_data?.cost.toFixed(2) || 0.0
      }</p>
      <p>Total Cost: Ksh ${totalCost.toFixed(2)}</p>
    `;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
    printWindow?.print();
    setTimeout(() => {
      toast.success("saved billing details successfully!", {
        autoClose: 1000, // Show toast for 2 seconds
        onClose: () => {
          router.push("/departments/billing");
          window.location.reload(); // Refresh after the toast disappears
        },
      });
    }, 1000);
    router.push("/departments/billing");
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
              <label className="font-medium">Consultation Fee (Ksh):</label>
              <Input
                type="text"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="Enter consultation fee"
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Lab Cost */}

            <div className="mb-4">
              <label className="font-medium">Lab Cost (Ksh):</label>
              <Input
                type="number"
                value={visitData?.lab_data?.total_cost || 0}
                readOnly
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Pharmacy Cost */}
            <div className="mb-4">
              <label className="font-medium">Pharmacy Cost (Ksh):</label>
              <Input
                type="number"
                value={visitData?.pharmacy_data?.cost || 0}
                readOnly
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Calculate Total Button */}

            <Button className="mt-4" onClick={calculateTotalCost}>
              Generate Total Cost
            </Button>

            {/* Total Cost */}
            <div className="mt-4">
              <p className="font-medium">
                Total Cost: Ksh{totalCost.toFixed(2)}
              </p>
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
      <ToastContainer />
    </PageTransition>
  );
};

export default BillingDetailsPage;
