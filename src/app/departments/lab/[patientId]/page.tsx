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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const orders =
    visitData?.consultation_data?.lab_test_ordered
      ?.filter((test) => !test.administered)
      .map((test) => ({
        service: test.service,
        duration: test.duration,
        cost: test.cost,
        administered: test.administered,
      })) ?? [];

  useEffect(() => {
    const calculatedTotalCost = orders.reduce(
      (sum, test) => sum + test.cost,
      0
    );
    setTotalCost(calculatedTotalCost);
  }, [orders]);

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  const handleResultChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    testOrder: string
  ) => {
    setTestOrders((prev) => ({
      ...prev,
      [testOrder]: e.target.value,
    }));
  };

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
      return response.data || null;
    } catch (error) {
      console.error("Error checking lab record:", error);
      return null;
    }
  };

  const handleSubmitResults = async () => {
    // Validation checks
    if (!visitData?.consultation_data?.lab_tests_paid_status) {
      toast.error("Cannot submit results - payment is pending");
      return;
    }

    const missingResults = orders.some(
      (testOrder) => !testOrders[testOrder.service]?.trim()
    );

    if (missingResults) {
      toast.error("Please enter results for all tests before submitting");
      return;
    }

    setIsSubmitting(true);
    const formattedResults = orders.map((test) => ({
      service: test.service,
      result: testOrders[test.service] || "",
      cost: test.cost,
    }));

    try {
      if (orders.length === 1) {
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

      const existingLabRecord = await checkLabRecordExists(visitData?.visit_id);

      if (existingLabRecord) {
        const updatedResults = [
          ...existingLabRecord.result,
          ...formattedResults,
        ];
        const updatedTotalCost =
          parseInt(existingLabRecord.total_cost) + totalCost;

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

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

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

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting test results:", error);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    router.push("/departments/lab");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!patientId) {
    return <div className="p-6">Loading patient details...</div>;
  }

  return (
    <PageTransition>
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Test Results for {visitData?.patient_data?.first_name}{" "}
              {visitData?.patient_data?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation alerts */}
            {!visitData?.consultation_data?.lab_tests_paid_status && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>Payment must be completed before submitting results</span>
              </div>
            )}

            {orders.some(
              (testOrder) => !testOrders[testOrder.service]?.trim()
            ) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>Please enter results for all tests</span>
              </div>
            )}

            {visitData?.consultation_data?.lab_tests_paid_status &&
              !orders.some(
                (testOrder) => !testOrders[testOrder.service]?.trim()
              ) && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                  <span>Ready to submit results</span>
                </div>
              )}

            {/* Payment status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment Status:</span>
                {visitData?.consultation_data?.lab_tests_paid_status ? (
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Paid
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Pending
                  </Badge>
                )}
              </div>
              <Button onClick={handleRefresh}>Refresh Page</Button>
            </div>

            {/* Tests table */}
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
                        required
                        className={
                          !testOrders[testOrder.service]?.trim()
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <label className="block font-semibold mb-1">Total Cost</label>
              <Input type="number" value={totalCost} readOnly />
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleSubmitResults}
              disabled={
                isSubmitting ||
                !visitData?.consultation_data?.lab_tests_paid_status ||
                orders.some(
                  (testOrder) => !testOrders[testOrder.service]?.trim()
                )
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Results"
              )}
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
