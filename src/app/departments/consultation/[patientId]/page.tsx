"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useRouter } from "next/navigation";
import { useVisit } from "@/context/VisitContext";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";
import { DiagnosisTab } from "@/components/tabs/DiagnosisTab";
import { MedicalHistoryTab } from "@/components/tabs/MedicalHistoryTab";
import { TestRequestTab } from "@/components/tabs/TestRequestTab";
import { PrescriptionsTab } from "@/components/tabs/PrescriptionsTab";
import { LabResultsTab } from "@/components/tabs/LabResultsTab";
import TransferPatientTab from "@/components/tabs/TransferPatientTab";

const PatientManagementPage = () => {
  const { patientId } = useParams();
  const router = useRouter();
  const { visitData, fetchVisitData, loading } = useVisit();
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const { authState } = useAuth();
  // const [refresh, setRefresh] = useState(false);

  // Fetch visit data for the current patient
  useEffect(() => {
    if (patientId && authState?.token) {
      fetchVisitData(patientId as string);
      const fetchAllVisits = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patient_visits/${patientId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          setAllVisits(response.data);
        } catch (error) {
          console.error("Failed to fetch visits:", error);
        }
      };

      fetchAllVisits();
    }
  }, [fetchVisitData, patientId, authState.token]);

  // Handle saving test requests
  const handleSaveTestRequests = async () => {
    console.log(testRequests);
  
    try {
      // Update the visit state to "LABORATORY"
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
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
  
      // Append new test requests to existing ones
      const updatedTestRequests = [
        ...(visitData?.consultation_data?.lab_test_ordered || []),
        ...testRequests,
      ];
  
      // Save the updated test requests to the consultation
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          lab_tests_ordered: updatedTestRequests,
          visit: visitData?.visit_id,
          physician: authState?.user_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
  
      setTimeout(() => {
        toast.success("Test order saved successfully", {
          autoClose: 5000, // Show toast for 5 seconds
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to save test requests:", error);
      toast.error("Failed to save test requests. Please try again.", {
        autoClose: 1000,
      });
    }
  };

  // Handle saving drug prescriptions
 const handleSaveDrugPrescriptions = async () => {
    console.log(prescriptions);
  
    try {
      // Update the visit state to "PHARMACY"
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/visits/${visitData?.visit_id}/`,
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
  
      // Append new prescriptions to existing ones
      const updatedPrescriptions = [
        ...(visitData?.consultation_data?.prescription || []),
        ...prescriptions,
      ];
  
      // Save the updated prescriptions to the consultation
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
        {
          prescription: updatedPrescriptions,
          visit: visitData?.visit_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
  
      setTimeout(() => {
        toast.success("Prescriptions saved successfully", {
          autoClose: 5000, // Show toast for 5 seconds
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to save prescriptions:", error);
      toast.error("Failed to save prescriptions. Please try again.", {
        autoClose: 1000,
      });
    }
  };

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
                  {Object.entries(visitData?.triage_data.vital_signs).map(
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
        <Tabs defaultValue="medicalHistory" className="w-full">
          <TabsList>
            <TabsTrigger value="medicalHistory">Medical History</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="testRequests">Test Requests</TabsTrigger>
            <TabsTrigger value="labResults">Lab Results</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="transferPatient">Transfer Patient</TabsTrigger>
          </TabsList>

          {/* Medical History Tab */}
          <TabsContent value="medicalHistory">
            <MedicalHistoryTab visitData={visitData} />
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis">
            <DiagnosisTab visitData={visitData} />
          </TabsContent>

          {/* Test Requests Tab */}
          <TabsContent value="testRequests">
            <TestRequestTab
              testRequests={testRequests}
              setTestRequests={setTestRequests}
              handleSaveTestRequests={handleSaveTestRequests}
              visitData={visitData}
            />
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="labResults">
            <LabResultsTab
              labResults={visitData?.lab_data?.result || []}
              visitId={visitData?.visit_id}
              authState={authState}
              patientId={patientId}
            />
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <PrescriptionsTab
              prescriptions={prescriptions}
              setPrescriptions={setPrescriptions}
              handleSaveDrugPrescriptions={handleSaveDrugPrescriptions}
              note_id={visitData?.consultation_data?.note_id}
              visit={visitData?.visit_id}
              visitData={visitData}
              patientId={patientId}
            />
          </TabsContent>

          {/* Transfer Patient Tab */}
          <TabsContent value="transferPatient">
            <TransferPatientTab
              visitId={visitData?.visit_id}
              authState={authState}
              onTransferSuccess={() => {
                toast.success("Patient transferred successfully!");
                router.push("/departments/consultation/patients"); // Redirect after transfer
              }}
              visitData={visitData}
            />
          </TabsContent>
        </Tabs>
      </div>
      <ToastContainer />
    </PageTransition>
  );
};

export default PatientManagementPage;
