"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";

interface Disease {
  id?: number;
  name: string;
}

export default function DiseaseManagement() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDisease, setCurrentDisease] = useState<Disease | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/diseases/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authState?.token}`,
          },
        }
      );
      const data = await response.json();
      setDiseases(data);
    } catch (error) {
      console.error("Failed to fetch diseases:", error);
      toast.error("Failed to fetch diseases.");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch all diseases on page load
  useEffect(() => {
    fetchDiseases();
  }, []);

  // Filter diseases based on search query
  const filteredDiseases = diseases.filter((disease) =>
    disease.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding or editing a disease
  const handleSaveDisease = async (disease: Disease) => {
    try {
      const url = currentDisease
        ? `${process.env.NEXT_PUBLIC_API_URL}/diseases/${currentDisease.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/diseases/`;
      const method = currentDisease ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(disease),
      });

      if (response.ok) {
        toast.success(
          currentDisease
            ? "Disease updated successfully!"
            : "Disease added successfully!"
        );
        fetchDiseases();
        setIsDialogOpen(false);
        setCurrentDisease(null);
      } else {
        throw new Error("Failed to save disease.");
      }
    } catch (error) {
      console.error("Failed to save disease:", error);
      toast.error("Failed to save disease.");
    }
  };

  // Handle deleting a disease
  const handleDeleteDisease = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/diseases/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Disease deleted successfully!");
        fetchDiseases();
      } else {
        throw new Error("Failed to delete disease.");
      }
    } catch (error) {
      console.error("Failed to delete disease:", error);
      toast.error("Failed to delete disease.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search diseases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3"
        />
        <Button
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Disease
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <p className="text-center">Loading diseases...</p>}

      {/* Disease Table */}
      {!isLoading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Disease Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiseases.map((disease) => (
              <TableRow key={disease.id}>
                <TableCell>{disease.name}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-white"
                    onClick={() => {
                      setCurrentDisease(disease);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white dark:text-white"
                    onClick={() => handleDeleteDisease(disease.id!)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Disease Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentDisease ? "Edit Disease" : "Add Disease"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const disease = {
                name: formData.get("name") as string,
              };
              handleSaveDisease(disease);
            }}
          >
            <Input
              className="mb-2"
              name="name"
              placeholder="Disease Name"
              defaultValue={currentDisease?.name}
              required
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
