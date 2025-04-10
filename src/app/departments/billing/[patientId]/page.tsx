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
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const BillingDetailsPage = () => {
  const params = useParams();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const router = useRouter();
  const { fetchVisitData, visitData } = useVisit();
  const [totalCost, setTotalCost] = useState<number>(0);
  const [finalCost, setFinalCost] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Automatic calculation when data changes
  useEffect(() => {
    calculateTotalCost();
  }, [visitData]);

  // Calculate total cost and apply discount automatically
  const calculateTotalCost = () => {
    const consultationCost = visitData?.consultation_data?.total_cost || 0;
    const labCost =
      visitData?.consultation_data?.lab_test_ordered?.reduce(
        (sum, test) => sum + test.cost,
        0
      ) || 0;
    const pharmacyCost =
      visitData?.consultation_data?.prescription?.reduce(
        (sum, prescription) =>
          sum + prescription.cost * parseInt(prescription.prescribed_quantity),
        0
      ) || 0;

    const total = consultationCost + labCost + pharmacyCost;
    setTotalCost(total);
    setFinalCost(total);
  };

  // Confirm payment for lab tests and add to total
  const confirmLabTestsPayment = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          visit: visitData?.visit_id,
          lab_tests_paid_status: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      toast.success("Lab tests payment confirmed successfully!");
      fetchVisitData(patientId);
    } catch (error) {
      console.error("Error confirming lab tests payment:", error);
      toast.error("Failed to confirm lab tests payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm payment for prescriptions and add to total
  const confirmPrescriptionsPayment = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          visit: visitData?.visit_id,

          prescription_paid_status: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      toast.success("Prescriptions payment confirmed successfully!");
      fetchVisitData(patientId);
    } catch (error) {
      console.error("Error confirming prescriptions payment:", error);
      toast.error("Failed to confirm prescriptions payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save billing details, checkout patient, and offer receipt printing
  const handleSaveBilling = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          consultation_cost: visitData?.consultation_data?.total_cost,
          laboratory_cost: visitData?.lab_data?.total_cost,
          pharmacy_cost: visitData?.pharmacy_data?.cost,
          total_cost: totalCost,
          final_cost: finalCost,
          visit: visitData?.visit_id,
          billed_by: authState?.user_id,
        }),
      });

      if (res.ok) {
        // Checkout the patient
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
      } else {
        throw new Error("Failed to save billing details");
      }
    } catch (error) {
      console.error("Error saving billing details:", error);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print receipt (with discount percentage)
  const handlePrintReceipt = () => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .header img { width: 150px; height: auto; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; color: #333; }
            .header p { margin: 5px 0; font-size: 14px; color: #666; }
            .content { margin-top: 20px; }
            .content h2 { font-size: 20px; color: #333; margin-bottom: 10px; }
            .content p { margin: 8px 0; font-size: 16px; color: #555; }
            .content .total { font-size: 18px; font-weight: bold; color: #000; margin-top: 20px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="/kerocureLogo-removebg-preview.png" alt="Organization Logo" />
              <h1>KEROCURE MEDICAL CENTER</h1>
              <p>PO BOX: 3192, KISII</p>
              <p>Email: Kerocure1@gmail.com | Tel: +254 725 808 100</p>
            </div>
            <div class="content">
              <h2>Receipt</h2>
              <p><strong>Patient Name:</strong> ${
                visitData?.patient_data?.first_name
              } ${visitData?.patient_data?.last_name}</p>
              <p><strong>Consultation Fee:</strong> Ksh ${
                visitData?.consultation_data?.total_cost || 0.0
              }</p>
              <p><strong>Lab Cost:</strong> Ksh ${
                visitData?.lab_data?.total_cost || 0.0
              }</p>
              <p><strong>Pharmacy Cost:</strong> Ksh ${
                visitData?.pharmacy_data?.cost || 0.0
              }</p>
              
              <p class="total"><strong>Final Cost:</strong> Ksh ${finalCost.toFixed(
                2
              )}</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing KEROCURE MEDICAL CENTER!</p>
              <p>For inquiries, please contact us at +254 725 808 100.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
    printWindow?.print();

    setTimeout(() => {
      router.push("/departments/billing");
    }, 1000);
  };
  const confirmConsultationPayment = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          visit: visitData?.visit_id,

          consultation_paid_status: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      toast.success("Consultation payment confirmed successfully!");
      fetchVisitData(patientId);
    } catch (error) {
      console.error("Error confirming Consultation payment:", error);
      toast.error("Failed to confirm Consultation payment.");
    } finally {
      setIsLoading(false);
    }
  };
  console.log(visitData?.visit_status);

  const ConsultationCard = () => (
    <Card>
      <CardHeader>
        <CardTitle>Consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span>Consultation Fee</span>
          <span>Ksh {visitData?.consultation_data?.total_cost || 0.0}</span>
        </div>
        <div className="mt-4">
          {visitData?.consultation_data?.prescription_paid_status ? (
            <Badge className="bg-green-500 dark:bg-green-500 dark:text-white text-white">
              Paid
            </Badge>
          ) : (
            <Button onClick={confirmConsultationPayment} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Payment"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <div className="flex justify-between">
        <Button onClick={handleRefresh}>Refresh Page</Button>
        {visitData?.visit_status === "completed" && (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-500 text-white dark:bg-green-600 dark:text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Patient Cleared
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 space-y-6">
        {/* Consultation Card */}

        {/* Lab Tests Card */}
        {(visitData?.consultation_data?.lab_test_ordered ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visitData?.consultation_data?.lab_test_ordered.map(
                  (test, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{test.service}</span>
                      <span>Ksh {test.cost}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4">
                <p className="font-medium">
                  Total Lab Tests Cost: Ksh{" "}
                  {visitData?.consultation_data?.lab_test_ordered
                    .reduce((sum, test) => sum + test.cost, 0)
                    .toFixed(2) || 0}
                </p>
                {visitData?.consultation_data?.lab_tests_paid_status ? (
                  <Badge className="dark:bg-green-500 bg-green-500 text-white dark:text-white">
                    Paid
                  </Badge>
                ) : (
                  <Button onClick={confirmLabTestsPayment} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Confirm Payment"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prescriptions Card */}
        {(visitData?.consultation_data?.prescription ?? []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visitData?.consultation_data?.prescription.map(
                  (prescription, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>{prescription.drug_name}</span>
                      <span>
                        Ksh{" "}
                        {(
                          prescription.cost *
                          parseInt(prescription.prescribed_quantity)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4">
                <p className="font-medium">
                  Total Prescriptions Cost: Ksh{" "}
                  {visitData?.consultation_data?.prescription
                    .reduce(
                      (sum, prescription) =>
                        sum +
                        prescription.cost *
                          parseInt(prescription.prescribed_quantity),
                      0
                    )
                    .toFixed(2)}
                </p>
                {visitData?.consultation_data?.prescription_paid_status ? (
                  <Badge className="bg-green-500 dark:bg-green-500 dark:text-white text-white">
                    Paid
                  </Badge>
                ) : (
                  <Button
                    onClick={confirmPrescriptionsPayment}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm Payment"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <ConsultationCard />

        {/* Billing Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Billing Summary for {visitData?.patient_data?.first_name}{" "}
              {visitData?.patient_data?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="font-medium">Consultation Cost (Ksh):</label>
              <Input
                type="text"
                value={visitData?.consultation_data?.total_cost || 0.0}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="font-medium">Lab Cost (Ksh):</label>
              <Input
                type="number"
                value={visitData?.consultation_data?.lab_test_ordered
                  ?.reduce((sum, test) => sum + test.cost, 0)
                  .toFixed(2)}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="font-medium">Pharmacy Cost (Ksh):</label>
              <Input
                type="number"
                value={
                  visitData?.consultation_data?.prescription
                    ?.reduce(
                      (sum, prescription) =>
                        sum +
                        prescription.cost *
                          parseInt(prescription.prescribed_quantity),
                      0
                    )
                    .toFixed(2) || 0
                }
                readOnly
              />
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-medium text-lg">
                Subtotal: Ksh {totalCost.toFixed(2)}
              </p>
            </div>

            {visitData?.visit_status === "completed" ? (
              <Button
                className="mt-4 bg-blue-600 dark:text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                onClick={handleSaveBilling}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Save & Complete Visit"}
              </Button>
            ) : (
              <Button
                className="mt-4 bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                disabled
              >
                Pending
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Success Alert Dialog */}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Visit Completed Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                Billing details saved and patient checked out successfully.
                Would you like to print the receipt now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => router.push("/departments/billing")}
              >
                Later
              </AlertDialogAction>
              <AlertDialogAction onClick={handlePrintReceipt}>
                Print Receipt
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
