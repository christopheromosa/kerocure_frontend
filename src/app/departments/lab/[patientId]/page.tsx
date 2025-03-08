"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useVisit } from "@/context/VisitContext";
import PageTransition from "@/components/PageTransition";
import axios from "axios";
import { useRouter } from "next/navigation";

type LabTestOrder = {
  service: string;
  duration: string;
  cost: number;
};

type ConsultationData = {
  lab_test_ordered: LabTestOrder[];
  // Add other properties as needed
};

type VisitData = {
  consultation_data: ConsultationData;
  // Add other properties as needed
};

const LabResultsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const { visitData, fetchVisitData } = useVisit();
  const [testOrders, setTestOrders] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number>(0);

  // Extract test names, duration, and cost from lab_test_ordered
  const orders: { service: string; duration: string; cost: number }[] =
    visitData?.consultation_data?.lab_test_ordered?.map((test) => ({
      service: test.service,
      duration: test.duration,
      cost: test.cost,
    })) ?? [];

  // Calculate total cost whenever orders change
  useEffect(() => {
    const calculatedTotalCost = orders.reduce((sum, test) => sum + test.cost, 0);
    setTotalCost(calculatedTotalCost);
  }, [orders]);

  // Fetch patient details and test orders on page load
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Function to handle updating test results
  const handleResultChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    testOrder: string // testOrder is the service name
  ) => {
    setTestOrders((prev) => ({
      ...prev,
      [testOrder]: e.target.value,
    }));
  };

  // Function to submit test results
  const handleSubmitResults = async () => {
    // Format results for submission
    const formattedResults = orders.map((test) => ({
      service: test.service,
      result: testOrders[test.service] || "", // Use the service name as the key
      cost: test.cost,
    }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lab/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          result: formattedResults, // Send all results as an array
          visit: visitData?.visit_id,
          note: visitData?.consultation_data?.note_id,
          recorded_by: authState?.user_id,
          total_cost: totalCost, // Use the calculated total cost
        }),
      });

      if (res.ok) {
        // Update visit state
        await axios.put(
          `http://localhost:8000/visits/${visitData?.visit_id}/`,
          {
            patient: patientId,
            current_state: "LABORATORY",
            next_state: "CONSULTATION",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        // Show success dialog and toast
        setShowSuccessDialog(true);
        setTimeout(() => {
          toast.success("Submitted test results successfully!", {
            autoClose: 1000,
            onClose: () => {
              router.push("/departments/lab");
              // Refresh after the toast disappears
            },
          });
        }, 1000);
      } else {
        throw new Error("Failed to submit test results");
      }
    } catch (error) {
      console.error("Error submitting test results:", error);
      setShowErrorDialog(true);
    }
  };

  if (!patientId) {
    return <div className="p-6">Loading patient details...</div>;
  }

  return (
    <PageTransition>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Test Results for {visitData?.patient_data?.first_name}{" "}
              {visitData?.patient_data?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((testOrder, index) => (
                  <TableRow key={index}>
                    <TableCell>{testOrder.service}</TableCell>
                    <TableCell>{testOrder.duration}</TableCell>
                    <TableCell>{testOrder.cost}</TableCell>
                    <TableCell>
                      <Input
                        value={testOrders[testOrder.service] || ""}
                        onChange={(e) => handleResultChange(e, testOrder.service)}
                        placeholder="Enter result"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <label className="block font-semibold mb-1">Total Cost</label>
              <Input
                type="number"
                value={totalCost}
                readOnly // Make total cost read-only since it's calculated dynamically
              />
            </div>
            <Button className="mt-4" onClick={handleSubmitResults}>
              Submit Results
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
                Test results submitted successfully!
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
                Failed to submit test results. Please try again.
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

export default LabResultsPage;
