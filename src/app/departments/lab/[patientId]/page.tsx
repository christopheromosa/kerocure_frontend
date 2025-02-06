"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import PageTransition from "@/components/PageTransition";
import axios from "axios";
import { useRouter } from "next/navigation";

const LabResultsPage = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const { authState } = useAuth();
  const { visitData, fetchVisitData } = useVisit();
  const [testOrders, setTestOrders] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Extract test names from lab_test_ordered
  const orders: string[] =
    visitData?.consultation_data?.lab_test_ordered?.map(
      (test) => test.test_name
    ) ?? [];

  // Fetch patient details and test orders on page load
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId.toString());
    }
  }, [patientId, fetchVisitData]);

  // Function to handle updating test results
  const handleResultChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    testOrder: string
  ) => {
    setTestOrders((prev) => ({
      ...prev,
      [testOrder]: e.target.value,
    }));
  };

  // Function to submit test results
  const handleSubmitResults = async () => {
    const formattedResults = Object.entries(testOrders).map(([key, value]) => ({
      [key]: value,
    }));

    try {
      const res = await fetch("http://localhost:8000/lab/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          result: formattedResults,
          visit: visitData?.visit_id,
          note: visitData?.consultation_data?.note_id,
          recorded_by: authState?.user_id,
        }),
      });

      if (res.ok) {
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
        setShowSuccessDialog(true);
        router.push("/departments/lab");
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
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((testOrder, index) => (
                  <TableRow key={index}>
                    <TableCell>{testOrder}</TableCell>{" "}
                    {/* Render the test name */}
                    <TableCell>
                      <Input
                        value={testOrders[testOrder] || ""}
                        onChange={(e) => handleResultChange(e, testOrder)}
                        placeholder="Enter result"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </PageTransition>
  );
};

export default LabResultsPage;
