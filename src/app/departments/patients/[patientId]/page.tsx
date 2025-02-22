// app/patients/[patientId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaMale, FaFemale, FaUser } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import OrganizationInfo from "@/components/OrganizationInfo";

type PatientType = {
  patientId: number;
  first_name: string;
  last_name: string;
  dob: Date;
  residence: string;
  contact_number: string;
  next_of_kin_name: string;
  next_of_kin_contact_number: string;
  gender: string;
};

export default function PatientPage() {
  const { patientId } = useParams();
  const router = useRouter();
  const { authState } = useAuth();
  const [patient, setPatient] = useState<PatientType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/patients/${patientId}`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch patient data");
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        toast.error("Failed to load patient data");
      }
    };
    fetchPatient();
  }, [patientId, authState?.token]);

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/patients/${patientId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to delete patient");
        toast.success("Patient deleted successfully");
        router.push("/patients"); // Redirect to patient list
      } catch (error) {
        toast.error("Failed to delete patient");
      }
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      const response = await fetch(
        `http://localhost:8000/patients/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(patient),
        }
      );
      if (!response.ok) throw new Error("Failed to update patient");
      toast.success("Patient updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update patient");
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {patient.first_name} {patient.last_name}
        </h1>
        <div className="space-x-2">
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={patient.first_name}
                onChange={(e) =>
                  setPatient({ ...patient, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={patient.last_name}
                onChange={(e) =>
                  setPatient({ ...patient, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={new Date(patient.dob).toISOString().split("T")[0]}
                onChange={(e) =>
                  setPatient({ ...patient, dob: new Date(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Residence</Label>
              <Input
                value={patient.residence}
                onChange={(e) =>
                  setPatient({ ...patient, residence: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={patient.contact_number}
                onChange={(e) =>
                  setPatient({ ...patient, contact_number: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Next of Kin Name</Label>
              <Input
                value={patient.next_of_kin_name}
                onChange={(e) =>
                  setPatient({ ...patient, next_of_kin_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Next of Kin Contact</Label>
              <Input
                value={patient.next_of_kin_contact_number}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    next_of_kin_contact_number: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Gender</Label>
              <select
                value={patient.gender}
                onChange={(e) =>
                  setPatient({ ...patient, gender: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      ) : (
        <div className="p-6  shadow-md rounded-md border">
          {/* Organization Details */}
          <OrganizationInfo />
          {/* Patient Details */}
          <div className="flex justify-around items-center space-x-6 ">
            <div className="flex-shrink-0">
              {patient.gender === "male" ? (
                <FaUser className="h-40 w-40 text-blue-500" />
              ) : (
                <FaUser className="h-40 w-40 text-pink-500" />
              )}
            </div>
            <div className="space-y-2">
              <p>
                <strong>First Name:</strong>
                {patient.first_name}
              </p>
              <p>
                <strong>Last Name:</strong> {patient.last_name}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(patient.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Residence:</strong> {patient.residence}
              </p>
              <p>
                <strong>Contact Number:</strong> {patient.contact_number}
              </p>
              <p>
                <strong>Next of Kin:</strong> {patient.next_of_kin_name}
              </p>
              <p>
                <strong>Next of Kin Contact:</strong>{" "}
                {patient.next_of_kin_contact_number}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
