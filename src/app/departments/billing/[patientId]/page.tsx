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

const BillingDetailsPage = () => {
  const params = useParams();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const router = useRouter();
  const { fetchVisitData, visitData } = useVisit();
  const [totalCost, setTotalCost] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalCost, setFinalCost] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Calculate total cost and apply discount
  const calculateTotalCost = () => {
    const consultationCost = visitData?.consultation_data?.total_cost || 0;
    const labCost = visitData?.lab_data?.total_cost || 0;
    const pharmacyCost = visitData?.pharmacy_data?.cost || 0;

    const total = consultationCost + labCost + pharmacyCost;
    setTotalCost(total);

    const discount = (total * discountPercentage) / 100;
    setDiscountAmount(discount);

    const final = total - discount;
    setFinalCost(final);
  };

  // Handle discount percentage input change
  const handleDiscountPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const percentage = parseFloat(e.target.value);
    setDiscountPercentage(percentage);
  };

  // Confirm payment for lab tests
  const confirmLabTestsPayment = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
         visit:visitData?.visit_id,
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
      fetchVisitData(patientId); // Refresh visit data
    } catch (error) {
      console.error("Error confirming lab tests payment:", error);
      toast.error("Failed to confirm lab tests payment.");
    }
  };

  // Confirm payment for prescriptions
  const confirmPrescriptionsPayment = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
        visit:visitData?.visit_id,
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
      fetchVisitData(patientId); // Refresh visit data
    } catch (error) {
      console.error("Error confirming prescriptions payment:", error);
      toast.error("Failed to confirm prescriptions payment.");
    }
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
          consultation_cost: visitData?.consultation_data?.total_cost,
          laboratory_cost: visitData?.lab_data?.total_cost,
          pharmacy_cost: visitData?.pharmacy_data?.cost,
          total_cost: totalCost,
          discount_percentage: discountPercentage,
          discount_amount: discountAmount,
          final_cost: finalCost,
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
            visit_status: "completed",
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
          toast.success("Saved billing details successfully!", {
            autoClose: 5000,
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

  // Print receipt (with discount percentage)
  const handlePrintReceipt = () => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header img {
              width: 150px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              font-size: 14px;
              color: #666;
            }
            .content {
              margin-top: 20px;
            }
            .content h2 {
              font-size: 20px;
              color: #333;
              margin-bottom: 10px;
            }
            .content p {
              margin: 8px 0;
              font-size: 16px;
              color: #555;
            }
            .content .total {
              font-size: 18px;
              font-weight: bold;
              color: #000;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="/kerocureLogo-removebg-preview.png" alt="Organization Logo" />
              <h1>KEROCURE MEDICAL CENTER</h1>
              <p>PO BOX: 3192, KISII</p>
              <p>Email: Kerocure1@gmail.com | Tel: +254 725 808 100</p>
            </div>
    
            <!-- Content -->
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
              ${
                 discountPercentage > 0
                   ? `<p><strong>Discount Percentage:</strong> ${discountPercentage}%</p>`
                   : ""
               }
              <p class="total"><strong>Final Cost:</strong> Ksh ${finalCost.toFixed(
                2
              )}</p>
            </div>
    
            <!-- Footer -->
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
      toast.success("Patient checkout successfully", {
        autoClose: 1000,
        onClose: () => {
          router.push("/departments/billing");
          
        },
      });
    }, 1000);
  };

  return (
    <PageTransition>
      {isLoading && <LoadingPage />}
      <div className="p-6 space-y-6">
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
                    .toFixed(2)}
                </p>
                {visitData?.consultation_data?.lab_tests_paid_status ? (
                  <Badge className="dark:bg-green-500 bg-green-500 text-white dark:text-white">Paid</Badge>
                ) : (
                  <Button onClick={confirmLabTestsPayment}>
                    Confirm Payment
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
                      <span>Ksh {prescription.cost}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4">
                <p className="font-medium">
                  Total Prescriptions Cost: Ksh{" "}
                  {visitData?.consultation_data?.prescription
                    .reduce((sum, prescription) => sum + prescription.cost, 0)
                    .toFixed(2)}
                </p>
                {visitData?.consultation_data?.prescription_paid_status ? (
                  <Badge className="bg-green-500 dark:bg-green-500 dark:text-white text-white">Paid</Badge>
                ) : (
                  <Button onClick={confirmPrescriptionsPayment}>
                    Confirm Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Billing Card */}
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
              <label className="font-medium">Consultation Cost (Ksh):</label>
              <Input
                type="text"
                value={visitData?.consultation_data?.total_cost || 0.0}
                readOnly
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

            {/* Discount Percentage Input */}
            <div className="mb-4">
              <label className="font-medium">Discount Percentage (%):</label>
              <Input
                type="number"
                value={discountPercentage}
                onChange={handleDiscountPercentageChange}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            {/* Calculate Total Button */}
            <Button
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600 text-white mt-4"
              onClick={calculateTotalCost}
            >
              Generate Total Cost
            </Button>

            {/* Total Cost */}
            <div className="mt-4">
              <p className="font-medium">
                Total Cost: Ksh {totalCost.toFixed(2)}
              </p>
              <p className="font-medium">
                Discount Amount: Ksh {discountAmount.toFixed(2)}
              </p>
              <p className="font-medium">
                Final Cost (after discount): Ksh {finalCost.toFixed(2)}
              </p>
            </div>

            {/* Save Billing Button */}
            <Button
              className="mt-4 bg-blue-600 dark:text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              onClick={handleSaveBilling}
            >
              Save billing records
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
