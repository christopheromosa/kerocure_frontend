"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useRouter } from "next/navigation";
import { useVisit } from "@/context/VisitContext";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";
import OrganizationInfo from "@/components/OrganizationInfo";
import { DiagnosisTab } from "@/components/tabs/DiagnosisTab";
import { MedicalHistoryTab } from "@/components/tabs/MedicalHistoryTab";
import { TestRequestTab } from "@/components/tabs/TestRequestTab";
import { PrescriptionsTab } from "@/components/tabs/PrescriptionsTab";

const PatientManagementPage = () => {
  const { patientId } = useParams();
  const router = useRouter();
  const { visitData, fetchVisitData, loading } = useVisit();
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isDiagnosisSaved, setIsDiagnosisSaved] = useState<boolean>(false);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const { authState } = useAuth();

  // Fetch all patient visits on page load
  useEffect(() => {
    const fetchAllVisits = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/patient_visits/${patientId}`
        );
        setAllVisits(response.data);
      } catch (error) {
        console.error("Failed to fetch visits:", error);
      }
    };

    fetchAllVisits();
  }, [patientId]);

  // Fetch visit data for the current patient
  useEffect(() => {
    if (patientId) {
      fetchVisitData(patientId as string);
    }
  }, [fetchVisitData, patientId]);

  // Set diagnosis if it exists in visit data
  useEffect(() => {
    if (visitData?.consultation_data?.diagnosis) {
      setDiagnosis(visitData.consultation_data.diagnosis);
    }
  }, [visitData]);

  // Handle saving diagnosis
  const handleSaveDiagnosis = async () => {
    try {
      if (!visitData?.consultation_data?.note_id) {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          {
            diagnosis,
            prescription: [],
            lab_tests_ordered: [],
            physician: authState?.user_id,
            visit: visitData?.visit_id,
            triage: visitData?.triage_data?.triage_id,
          },
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setIsDiagnosisSaved(true);
        toast.success("Diagnosis saved successfully!", { autoClose: 1000 });
      } else {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
          {
            diagnosis,
            visit: visitData?.visit_id,
          },
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setIsDiagnosisSaved(true);
        toast.success("Diagnosis updated successfully!", { autoClose: 1000 });
      }
    } catch (error) {
      console.error("Failed to save diagnosis:", error);
      toast.error("Failed to save diagnosis. Please try again.", {
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
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis">
            <DiagnosisTab
              diagnosis={diagnosis}
              setDiagnosis={setDiagnosis}
              handleSaveDiagnosis={handleSaveDiagnosis}
              isDiagnosisSaved={isDiagnosisSaved}
            />
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medicalHistory">
            <MedicalHistoryTab visits={allVisits || []} />
          </TabsContent>

          {/* Test Requests Tab */}
          <TabsContent value="testRequests">
            <TestRequestTab
              testRequests={testRequests}
              setTestRequests={setTestRequests}
            />
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <PrescriptionsTab
              prescriptions={prescriptions}
              setPrescriptions={setPrescriptions}
            />
          </TabsContent>
        </Tabs>
      </div>
      <ToastContainer />
    </PageTransition>
  );
};

export default PatientManagementPage;
