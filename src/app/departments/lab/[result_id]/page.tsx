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

// Define the type for a test order
interface TestOrder {
  id: number;
  test_name: string;
  result: string;
}

const LabResultsPage = () => {
  const params = useParams();
  const resultId = params.result_id as string;
  const { authState } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  // Fetch patient details and test orders on page load
  useEffect(() => {
    const fetchPatientAndTestOrders = async () => {
      try {
        // Fetch patient details
        const patientRes = await fetch(
          `http://localhost:8000/patients/${resultId}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!patientRes.ok) {
          throw new Error("Failed to fetch patient details");
        }

        const patientData = await patientRes.json();
        setPatient(patientData);

        // Fetch test orders for the patient's visit
        const visitRes = await fetch(
          `http://localhost:8000/consultation/${patientData.visit_id}/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );

        if (!visitRes.ok) {
          throw new Error("Failed to fetch test orders");
        }

        const visitData = await visitRes.json();
        setTestOrders(visitData.test_orders || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowErrorDialog(true);
      }
    };

    fetchPatientAndTestOrders();
  }, [resultId, authState?.token]);

  // Function to handle updating test results
  const handleResultChange = (testId: number, result: string) => {
    setTestOrders((prev) =>
      prev.map((test) => (test.id === testId ? { ...test, result } : test))
    );
  };

  // Function to submit test results
  const handleSubmitResults = async () => {
    try {
      const res = await fetch("http://localhost:8000/lab/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authState?.token}`,
        },
        body: JSON.stringify({
          test_orders: testOrders,
        }),
      });

      if (res.ok) {
        setShowSuccessDialog(true);
      } else {
        throw new Error("Failed to submit test results");
      }
    } catch (error) {
      console.error("Error submitting test results:", error);
      setShowErrorDialog(true);
    }
  };

  if (!patient) {
    return <div className="p-6">Loading patient details...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Test Results for {patient.first_name} {patient.last_name}
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
              {testOrders.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.test_name}</TableCell>
                  <TableCell>
                    <Input
                      value={test.result}
                      onChange={(e) =>
                        handleResultChange(test.id, e.target.value)
                      }
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
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
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
  );
};

export default LabResultsPage;
