"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LoadingPage from "@/components/loading_animation";
import { useState, useEffect } from "react";

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
}

const StaffPage = () => {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "",
    phone_number: "",
  });
  const [responseData, setResponseData] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // Fetch staff data
  useEffect(() => {
    async function fetchStaffData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setStaffData(data);
      } catch (err) {
        alert("Failed to load staff records");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStaffData();
  }, []);

  // Handle form input changes
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to create staff account");

      const data = await response.json();
      setResponseData(data); // Store the response (username and password)
      setIsDialogOpen(false); // Close the form dialog
      setFormData({
        first_name: "",
        last_name: "",
        role: "",
        phone_number: "",
      }); // Reset form

      // Refresh the staff list
      const updatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/`
      );
      const updatedData = await updatedResponse.json();
      setStaffData(updatedData);
    } catch (error) {
      console.error("Error creating staff account:", error);
      alert("Failed to create staff account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {isLoading && <LoadingPage />}
      <h1 className="text-2xl font-bold mb-6">Staff List</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffData.map((staffMember, index) => (
            <TableRow key={index}>
              <TableCell>
                {staffMember.first_name} {staffMember.last_name}
              </TableCell>
              <TableCell>{staffMember.role}</TableCell>
              <TableCell>{staffMember.phone_number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
            Add Staff
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Enter the details of the new staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />

            <Select
              name="role"
              value={formData.role}
              onValueChange={(value) =>
                handleInputChange({ name: "role", value })
              }
              required
            >
              <SelectTrigger className="mt-1  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <SelectValue placeholder="Select a Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Triage">Triage</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Lab Technician">Lab Technician</SelectItem>
                <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Billing">Billing</SelectItem>
              </SelectContent>
            </Select>

            <Input
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Response Popup */}
      {responseData && (
        <Dialog
          open={!!responseData}
          onOpenChange={() => setResponseData(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account Created Successfully</DialogTitle>
              <DialogDescription>
                Here are the login credentials for the new staff member:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p>
                <strong>Username:</strong> {responseData.username}
              </p>
              <p>
                <strong>Password:</strong> {responseData.password}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StaffPage;
