"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParams, useRouter } from "next/navigation";
import { useVisit } from "@/context/VisitContext";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import MDEditor from "@uiw/react-md-editor";
import LoadingPage from "@/components/loading_animation";

const testRequestsSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
});

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().min(1, "Dosage is required"),
});

type TestRequest = z.infer<typeof testRequestsSchema>;
type Prescription = z.infer<typeof prescriptionSchema>;

const PatientManagementPage = () => {
  const { patientId } = useParams();

  const router = useRouter();
  const { visitData, fetchVisitData, loading } = useVisit();
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showTestRequestPreview, setShowTestRequestPreview] = useState(false);
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);
  const [isDiagnosisSaved, setIsDiagnosisSaved] = useState<boolean>(false);
  const [consultationId, setConsultationId] = useState<number>();
   const [refresh, setRefresh] = useState(false);

  // const [labResults, setLabResults] = useState([]);
  const { authState } = useAuth();
  console.log(visitData?.consultation_data);

  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId as string);
    }
  }, [fetchVisitData, patientId,refresh]);

  useEffect(() => {
    if (visitData?.consultation_data?.diagnosis) {
      setDiagnosis(visitData.consultation_data.diagnosis);
    }
  }, [visitData]);
  console.log(
    "before updating diagnosis: ",
    visitData?.consultation_data?.note_id
  );

  const handleSaveDiagnosis = async () => {
    try {
      if (!visitData?.consultation_data?.note_id) {
        const res = await fetch(`http://localhost:8000/consultation/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify({
            diagnosis,
            prescription: [],
            lab_tests_ordered: [],
            physician: authState.user_id,
            visit: visitData?.visit_id,
            triage: visitData?.triage_data?.triage_id,
          }),
        });
        if (res.ok) {
          const consultation = await res.json();
          console.log(consultation);
          setConsultationId(consultation.note);
        }
        console.log(consultationId);
        setIsDiagnosisSaved(true);
        alert("Diagnosis saved successfully!");
        // router.push(`/departments/consultation/${patientId}`);
        router.refresh();
        setRefresh(!refresh);
      } else {
        const res = await fetch(
          `http://localhost:8000/consultation/${visitData?.consultation_data?.note_id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
            body: JSON.stringify({
              diagnosis: diagnosis,
              visit: visitData?.visit_id,
            }),
          }
        );
        if (res.ok) {
          const consultation = await res.json();
          console.log(consultation); // Log the response to see the updated consultation data
          setConsultationId(consultation.note); // Update the state if needed
          setIsDiagnosisSaved(true); // Update the state to reflect that the diagnosis is saved
          alert("Diagnosis updated successfully!");
          // router.push(`/departments/consultation/${patientId}`);
          router.refresh();
          setRefresh(!refresh);
        } else {
          console.error("Failed to update diagnosis");
          alert("Failed to update diagnosis. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to save diagnosis:", error);
      alert("Failed to save diagnosis. Please try again.");
    }
  };

  const {
    control: testRequestControl,
    handleSubmit: handleTestRequestSubmit,
    reset: resetTestRequestForm,
  } = useForm<TestRequest>({
    resolver: zodResolver(testRequestsSchema),
  });

  const {
    control: prescriptionControl,
    handleSubmit: handlePrescriptionSubmit,
    reset: resetPrescriptionForm,
  } = useForm<Prescription>({
    resolver: zodResolver(prescriptionSchema),
  });

  const handleAddTestRequest = (data: TestRequest) => {
    setTestRequests([...testRequests, data]);
    resetTestRequestForm();
  };

  const handleAddPrescription = (data: Prescription) => {
    setPrescriptions([...prescriptions, data]);
    resetPrescriptionForm();
  };

  const handleDeleteTestRequest = (index: number) => {
    setTestRequests(testRequests.filter((_, i) => i !== index));
  };

  const handleDeletePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveTestRequests = async () => {
    try {
      await axios.put(
        `http://localhost:8000/visits/${visitData?.visit_id}/`,
        {
          patient: patientId,
          current_state: "CONSULTATION",
          next_state: "LABORATORY",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      await axios.put(
        `http://localhost:8000/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          lab_tests_ordered: testRequests,
          visit: visitData?.visit_id,
          diagnosis: diagnosis,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      setShowTestRequestPreview(false);
      alert("Test requests saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to save test requests:", error);
    }
  };

  const handleSavePrescriptions = async () => {
    console.log("prescriptions: ", prescriptions);
    try {
      await axios.put(
        `http://localhost:8000/visits/${visitData?.visit_id}/`,
        {
          patient: patientId,
          current_state: "CONSULTATION",
          next_state: "PHARMACY",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      await axios.put(
        `http://localhost:8000/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          prescription: prescriptions,
          visit: visitData?.visit_id,
          diagnosis: diagnosis,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      setShowPrescriptionPreview(false);
      alert("Prescriptions saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
    }
  };

  const testRequestColumns: ColumnDef<TestRequest>[] = [
    {
      accessorKey: "test_name",
      header: "Test Name",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          className=""
          variant="destructive"
          onClick={() => handleDeleteTestRequest(row.index)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const prescriptionColumns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "medication",
      header: "Medication",
    },
    {
      accessorKey: "dosage",
      header: "Dosage",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => handleDeletePrescription(row.index)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const testRequestTable = useReactTable({
    data: testRequests,
    columns: testRequestColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const prescriptionTable = useReactTable({
    data: prescriptions,
    columns: prescriptionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageTransition>
      {loading && <LoadingPage />}
      <div className="px-6">
        {/* Patient Header */}
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-x-6 flex-wrap">
              {/* Patient Name */}
              <div>
                <CardTitle>
                  <span className="text-sm text-gray-700">Name: </span>
                  <strong className="text-sm text-gray-700 ml-2 capitalize">
                    {visitData?.patient_data?.first_name}{" "}
                    {visitData?.patient_data?.last_name}
                  </strong>
                </CardTitle>
              </div>

              {/* Vital Signs (Inline) */}
              {visitData?.triage_data?.vital_signs && (
                <div className="flex gap-x-4 text-sm text-gray-700">
                  {Object.entries(visitData.triage_data.vital_signs).map(
                    ([key, value]) => (
                      <span key={key} className="capitalize">
                        {key.replace("_", " ")}: <strong>{value}</strong>
                      </span>
                    )
                  )}
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/departments/consultation")}
                size="sm"
              >
                Back to patients
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Dynamic Tabs */}
        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="medicalHistory">Medical History</TabsTrigger>
            <TabsTrigger value="testRequests">Test Requests</TabsTrigger>
            <TabsTrigger value="labResults">Lab Results</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          {/* Diagnosis Section */}
          <TabsContent value="diagnosis">
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis </CardTitle>
              </CardHeader>
              <CardContent>
                <MDEditor
                  value={diagnosis}
                  onChange={(value) => {
                    setDiagnosis(value ?? "");
                    setIsDiagnosisSaved(false);
                  }}
                />

                <Button
                  className="mt-4"
                  onClick={handleSaveDiagnosis}
                  disabled={isDiagnosisSaved}
                >
                  {isDiagnosisSaved ? "Diagnosis Saved" : "Save Diagnosis"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Section */}
          <TabsContent value="medicalHistory">
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Fetch and display past records coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Requests Section */}
          <TabsContent value="testRequests">
            <Card>
              <CardHeader>
                <CardTitle>Test Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTestRequestSubmit(handleAddTestRequest)}>
                  <Controller
                    name="test_name"
                    control={testRequestControl}
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter test name" />
                    )}
                  />
                  <Button type="submit" className="mt-4">
                    Add Test Request
                  </Button>
                </form>
                <Table>
                  <TableHeader>
                    {testRequestTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.column.columnDef.header as string}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {testRequestTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.renderValue() as string}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  className="mt-4"
                  onClick={() => setShowTestRequestPreview(true)}
                >
                  Save Test Requests
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Section */}
          <TabsContent value="labResults">
            <Card>
              <CardHeader>
                <CardTitle>Lab Results</CardTitle>
              </CardHeader>
              <CardContent>
                {visitData?.lab_data?.length === 0 ? (
                  <p>Display lab results here once updated by the lab.</p>
                ) : (
                  visitData?.lab_data?.map((result, index) => (
                    <span key={index}>{result.result}</span>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Section */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePrescriptionSubmit(handleAddPrescription)}
                >
                  <Controller
                    name="medication"
                    control={prescriptionControl}
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter medication" />
                    )}
                  />
                  <div className="mt-4">
                    <Controller
                      name="dosage"
                      control={prescriptionControl}
                      render={({ field }) => (
                        <Input {...field} placeholder="Enter dosage" />
                      )}
                    />
                  </div>
                  <Button type="submit" className="mt-4">
                    Add Prescription
                  </Button>
                </form>
                <Table>
                  <TableHeader>
                    {prescriptionTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.column.columnDef.header as string}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {prescriptionTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.renderValue() as string}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  className="mt-4"
                  onClick={() => setShowPrescriptionPreview(true)}
                >
                  Save Prescriptions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Request Preview Dialog */}
        <AlertDialog
          open={showTestRequestPreview}
          onOpenChange={setShowTestRequestPreview}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Review Test Requests</AlertDialogTitle>
              <AlertDialogDescription>
                Please review the test requests before saving.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Table>
              <TableHeader>
                {testRequestTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.column.columnDef.header as string}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {testRequestTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.renderValue() as string}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveTestRequests}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Prescription Preview Dialog */}
        <AlertDialog
          open={showPrescriptionPreview}
          onOpenChange={setShowPrescriptionPreview}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Review Prescriptions</AlertDialogTitle>
              <AlertDialogDescription>
                Please review the prescriptions before saving.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Table>
              <TableHeader>
                {prescriptionTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.column.columnDef.header as string}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {prescriptionTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.renderValue() as string}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSavePrescriptions}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default PatientManagementPage;
