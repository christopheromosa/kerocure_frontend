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
import { Badge } from "@/components/ui/badge"; // Import Badge component

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

  // Filter test orders to display only those with administered: false
  const orders =
    visitData?.consultation_data?.lab_test_ordered
      ?.filter((test) => !test.administered)
      .map((test) => ({
        service: test.service,
        duration: test.duration,
        cost: test.cost,
        administered: test.administered,
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

  // Function to check if a lab record exists for the patient
  const checkLabRecordExists = async (visitId: any) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/check-lab-record/${visitId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      // If the response contains data, return it
      if (response.data) {
        return response.data;
      } else {
        return null; // No lab record found
      }
    } catch (error) {
      console.error("Error checking lab record:", error);
      return null;
    }
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
      // Prepare payload for LabTestSale
      if (orders.length === 1) {
        // Single test submission
        const singleTestPayload = {
          service: orders[0].service,
          operation_count: 1,
          total_amount: orders[0].cost,
        };

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/lab-test-sales/`,
          singleTestPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      } else if (orders.length > 1) {
        // Multiple tests submission
        const multipleTestsPayload = {
          tests: orders.map((test) => ({
            service: test.service,
            operation_count: 1,
            total_amount: test.cost,
          })),
        };

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/lab-test-sales/bulk/`,
          multipleTestsPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      }

      // Check if a lab record exists for the patient
      const existingLabRecord = await checkLabRecordExists(visitData?.visit_id);

      if (existingLabRecord) {
        console.log("Existing lab record:", existingLabRecord);
        // Append new results to the existing lab record
        const updatedResults = [
          ...existingLabRecord.result,
          ...formattedResults,
        ];
        const updatedTotalCost =
          parseInt(existingLabRecord.total_cost) + totalCost;
        console.log(totalCost);
        console.log(parseInt(existingLabRecord.total_cost));
        console.log(updatedTotalCost);

        // Update the existing lab record
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/lab/${existingLabRecord.result_id}/`,
          {
            visit: visitData?.visit_id,
            note: visitData?.consultation_data?.note_id,
            result: updatedResults,
            total_cost: updatedTotalCost,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      } else {
        // Create a new lab record
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/lab/`,
          {
            result: formattedResults,
            visit: visitData?.visit_id,
            note: visitData?.consultation_data?.note_id,
            recorded_by: authState?.user_id,
            total_cost: totalCost,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
      }

      // Prepare payload for updating lab_test_ordered
      const payload = {
        visit: visitData?.visit_id,
        lab_tests_ordered: visitData?.consultation_data?.lab_test_ordered.map(
          (test) => ({
            ...test,
            administered: orders.some((order) => order.service === test.service)
              ? true
              : test.administered,
          })
        ),
      };

      console.log("Payload for updating lab_test_ordered:", payload);

      // Update the administered field to true for the submitted test orders
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      // Update visit state
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
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

      toast.success("Submitted test results successfully!", {
        autoClose: 1000,
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting test results:", error);
      setShowErrorDialog(true);
    }
  };

  // Function to handle "OK" button click in the success dialog
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false); // Close the dialog
    router.push("/departments/lab"); // Redirect to /departments/lab
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
            {/* Display Paid Status */}
            <div className="mb-4">
              <p className="font-medium">
                Payment Status:{" "}
                {visitData?.consultation_data?.lab_tests_paid_status ? (
                  <Badge className="bg-green-500 dark:bg-green-500 text-white dark:text-white">Paid</Badge>
                ) : (
                  <Badge className="bg-red-500 dark:bg-red-500 dark:text-white text-white">Pending</Badge>
                )}
              </p>
            </div>

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
                        onChange={(e) =>
                          handleResultChange(e, testOrder.service)
                        }
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
