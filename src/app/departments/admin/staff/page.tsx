"use client";
import LoadingPage from "@/components/loading_animation";
import { useState, useEffect } from "react";
import { StaffTable } from "@/components/StaffTable";
import { AddStaffDialog } from "@/components/AddStaffDialog";
import { ResetPasswordDialog } from "@/components/ResetPasswordDIalogAdmin";
import { EditStaffDialog } from "@/components/EditStaffDialog";
import ResponsePopup from "@/components/ResponsePopup";
import { useAuth } from "@/context/AuthContext";
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

export interface Staff {
  id?: number;
  username?: string;
  first_name: string;
  last_name: string;
  roles: string[]; // Comma-separated roles (e.g., "Triage,Doctor")
  phone_number: string;
  password?: string;
  is_staff: boolean;
  is_active: boolean;
}

export default function StaffPage() {
  const { authState } = useAuth();
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Staff>({
    first_name: "",
    last_name: "",
    roles: [],
    phone_number: "",
    is_staff: false,
    is_active: true,
  });
  const [responseData, setResponseData] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Fetch staff data
  useEffect(() => {
    async function fetchStaffData() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setStaffData(data);
      } catch (err) {
        alert("Failed to load staff records");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStaffData();
  }, [authState?.token]);

  // Handle form input changes
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { name: string; value: string | boolean | string[] }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to create staff account");
      const data = await response.json();
      // Update local state immediately
          setStaffData((prev) => [
            ...prev,
            {
              ...data,
              roles: formData.roles,
              is_staff: formData.is_staff,
              is_active: formData.is_active,
            },
          ]);
      setResponseData({ username: data.username, password: "00000000" });
      setIsDialogOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        roles: [],
        phone_number: "",
        is_staff: false,
        is_active: true,
      });
      // Refresh the staff list
      
    } catch (error) {
      console.error("Error creating staff account:", error);
      alert("Failed to create staff account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle password reset
  const handleResetPassword = async (newPassword: string) => {
    if (!selectedStaff) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/${selectedStaff.id}/reset_password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );
      if (!response.ok) throw new Error("Failed to reset password");
      setIsResetDialogOpen(false);
      alert("Password reset successful");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a staff member
  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/${selectedStaff.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update staff account");
      setIsEditDialogOpen(false);
      alert("Staff account updated successfully");
      // Refresh the staff list
      const updatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/`,
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const updatedData = await updatedResponse.json();
      setStaffData(updatedData);
    } catch (error) {
      console.error("Error updating staff account:", error);
      alert("Failed to update staff account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  // Handle delete confirmation
    const handleDeleteStaff = async () => {
      if (!staffToDelete) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/${staffToDelete.id}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to delete staff account");
        setIsDeleteDialogOpen(false);
        alert("Staff account deleted successfully");
        // Refresh the staff list
        const updatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        const updatedData = await updatedResponse.json();
        setStaffData(updatedData);
      } catch (error) {
        console.error("Error deleting staff account:", error);
        alert("Failed to delete staff account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

  // Open edit dialog and populate form with selected staff data
  const openEditDialog = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      username: staff.username,
      first_name: staff.first_name,
      last_name: staff.last_name,
      roles: staff.roles,
      phone_number: staff.phone_number,
      is_staff: staff.is_staff,
      is_active: staff.is_active,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="p-6">
      {isLoading && <LoadingPage />}
      {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will delete the staff member related records. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteStaff}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
      <h1 className="text-2xl font-bold mb-6">Staff List</h1>

      {/* Staff Table */}
      <StaffTable
        staffData={staffData}
        onResetPassword={(staff) => {
          setSelectedStaff(staff);
          setIsResetDialogOpen(true);
        }}
        onEditStaff={(staff) => openEditDialog(staff)}
        onDeleteStaff={(staff) => {
                  setStaffToDelete(staff); // Set the staff to delete
                  setIsDeleteDialogOpen(true); // Open the confirmation dialog
                }}
      />

      {/* Add Staff Dialog */}
      <AddStaffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        selectedStaff={selectedStaff}
        onResetPassword={handleResetPassword}
      />

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedStaff={selectedStaff}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleEditStaff}
      />

      {/* Response Popup */}
      {responseData && (
        <ResponsePopup
          responseData={responseData}
          onClose={() => setResponseData(null)}
        />
      )}
    </div>
  );
}
