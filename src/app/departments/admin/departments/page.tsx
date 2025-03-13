"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import LoadingPage from "@/components/loading_animation";

export interface Department {
  id: number;
  name: string;
}

export default function DepartmentsPage() {
  const { authState } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Department>({
    id: 0,
    name: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  // Fetch departments
  useEffect(() => {
    async function fetchDepartments() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        alert("Failed to load departments");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDepartments();
  }, [authState?.token]);

  // Handle search
  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate results
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const displayedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle add department
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to add department");
      const newDepartment = await response.json();
      setDepartments([...departments, newDepartment]);
      setIsAddDialogOpen(false);
      setFormData({ id: 0, name: "" }); // Reset form data
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Failed to add department. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete department");
      setDepartments(departments.filter((department) => department.id !== id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/departments/${selectedDepartment.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update department");
      const updatedDepartment = await response.json();
      setDepartments(
        departments.map((department) =>
          department.id === updatedDepartment.id
            ? updatedDepartment
            : department
        )
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Failed to update department. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData(department);
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-6">
      {isLoading && <LoadingPage />}
      <h1 className="text-2xl font-bold mb-6">Departments</h1>
      {/* Add Department Button and Search Field */}
      <div className="flex justify-between items-center mb-6">
        <Button
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Department
        </Button>
        <Input
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
      </div>
      {/* Departments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedDepartments.map((department) => (
            <TableRow key={department.id}>
              <TableCell>{department.name}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-white"
                  onClick={() => openEditDialog(department)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                  onClick={() => openDeleteDialog(department)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Enter the details of the new department.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              name="name"
              placeholder="Department Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white text-white"
            >
              Add Department
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the details of {selectedDepartment?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input
              name="name"
              placeholder="Department Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-white"
            >
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDepartment?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
              onClick={() =>
                selectedDepartment?.id && handleDelete(selectedDepartment.id!)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
