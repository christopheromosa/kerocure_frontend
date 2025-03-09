"use client";
import { columns } from "@/components/tables/consultation-data-table/columns";
import { DataTable } from "@/components/tables/consultation-data-table/consultation-data-table";
import React, { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Department {
  id: number;
  name: string;
}

export default function ConsultationPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { authState } = useAuth();

  useEffect(() => {
    async function getTriagedPatientsData() {
      setIsLoading(true);
      // todo: implement fetch patients functionality
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/triage-patients/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          cache: "no-store",
        }
      );
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
        setIsLoading(false);
      }
    }
    getTriagedPatientsData();
  }, [authState.token]);
  useEffect(() => {
    async function getDepartments() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          cache: "no-store",
        }
      );
      if (response.ok) {
        const deptData = await response.json();
        setDepartments(deptData);
      }
    }
    getDepartments();
  }, [authState.token]);

  // Filter patients based on selected department
  const filteredData =
    selectedDepartment === "all"
      ? data
      : data.filter(
          (patient) =>
            (patient as any).department?.id === Number(selectedDepartment)
        );

  return (
    <PageTransition>
      {/* Department Select Dropdown */}
      <div className="mb-4 flex justify-around">
        <label htmlFor="department" className="mr-2 font-medium">
          Filter by Department:
        </label>
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-[250px] border rounded px-3 py-2">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>{" "}
            {/* Changed empty string to 'all' */}
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading && <LoadingPage />}
      <DataTable columns={columns} data={filteredData} />
    </PageTransition>
  );
}
