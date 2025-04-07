"use client";
import LoadingPage from "@/components/loading_animation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useDashboardData } from "@/context/DashboardContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "@/context/AuthContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const DashboardPage = () => {
  const { data, isLoading } = useDashboardData();
  const { authState } = useAuth();

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [departmentPatientsCount, setDepartmentPatientsCount] = useState<
    number | null
  >(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null); // Start date for filtering
  const [endDate, setEndDate] = useState<Date | null>(null); // End date for filtering
  const [filteredRevenues, setFilteredRevenues] = useState<any[]>([]); // State for filtered revenue data

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [authState?.token]);

  // Fetch department-specific patient count when a department is selected
  useEffect(() => {
    if (selectedDepartment) {
      const fetchDepartmentPatients = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/triage-department-patients/${selectedDepartment}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          if (!response.ok)
            throw new Error("Failed to fetch department patients");
          const data = await response.json();
          setDepartmentPatientsCount(data.length);
        } catch (error) {
          console.error("Error fetching department patients:", error);
        }
      };
      fetchDepartmentPatients();
    }
  }, [selectedDepartment, authState.token]);

  // Filter revenue data based on the selected date range
  useEffect(() => {
    if (data?.revenues && startDate && endDate) {
      const filtered = data.revenues.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
      setFilteredRevenues(filtered);
    } else {
      setFilteredRevenues(data?.revenues || []);
    }
  }, [data?.revenues, startDate, endDate]);

  const patientsInQueue = [
    { department: "Consultation", count: data?.consultationPatients },
    { department: "Laboratory", count: data?.labPatients },
    { department: "Pharmacy", count: data?.pharmacyPatients },
    { department: "Billing", count: data?.billingPatients },
  ];

  const formattedData = filteredRevenues.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }), // Converts "2025-02-05" to "Feb 5"
  }));
  // function to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {isLoading && <LoadingPage />}
      {/* Welcome Message and Refresh Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {authState?.first_name} {authState?.last_name}
        </h1>
        <Button onClick={handleRefresh}>Refresh Page</Button>
        <RoleSwitcher />
      </div>

      {/* Patients in Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Patients in Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {patientsInQueue.map((item) => (
              <Card key={item.department}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.department}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.department === "Consultation" ? (
                    <>
                      <Select
                        onValueChange={(value) => setSelectedDepartment(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-2xl font-bold mt-4">
                        {departmentPatientsCount ?? item.count}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold">{item.count}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  Ksh {data?.revenues.at(-1)?.total_cost ?? 0.0}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Revenue per Day</CardTitle>
            <div className="flex gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="p-2 border rounded"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined} // Convert null to undefined
                placeholderText="End Date"
                className="p-2 border rounded"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_cost" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latest Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Billing Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Consultation</TableHead>
                <TableHead>Laboratory</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Recorded at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.billingRecords.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.patient_name}</TableCell>
                  <TableCell>{transaction.consultation_cost}</TableCell>
                  <TableCell>Ksh {transaction.laboratory_cost}</TableCell>
                  <TableCell>{transaction.pharmacy_cost}</TableCell>
                  <TableCell className="text-green-500">
                    {transaction.total_cost}
                  </TableCell>
                  <TableCell>{transaction.recorded_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

