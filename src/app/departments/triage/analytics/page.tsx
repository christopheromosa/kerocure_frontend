"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useRouter } from "next/navigation";

type TriageType = {
  id: number;
  weight: number;
  height: number;
  systolic: number;
  diastolic: number;
  pulsets: number;
};

export default function TriagePage() {
  const [triageData, setTriageData] = useState<TriageType[]>([]);
  const [selectedTriage, setSelectedTriage] = useState<TriageType | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  // const router = useRouter();

  useEffect(() => {
    fetchTriageData();
  }, []);

  const fetchTriageData = async () => {
    try {
      const res = await fetch("http://localhost:8000/triage/");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setTriageData(data);
    } catch (error) {
      console.error("Error fetching triage data:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedTriage) return;
    try {
      const res = await fetch(
        `http://localhost:8000/triage/${selectedTriage.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedTriage),
        }
      );
      if (!res.ok) throw new Error("Failed to update triage");
      setOpenEdit(false);
      fetchTriageData(); // Refresh data
    } catch (error) {
      console.error("Error updating triage:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedTriage) return;
    try {
      const res = await fetch(
        `http://localhost:8000/triage/${selectedTriage.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete triage");
      setOpenDelete(false);
      fetchTriageData(); // Refresh data
    } catch (error) {
      console.error("Error deleting triage:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Triage Records</h1>

      {/* Triage Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Height</TableHead>
            <TableHead>Systolic</TableHead>
            <TableHead>Diastolic</TableHead>
            <TableHead>Pulse</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {triageData.map((triage) => (
            <TableRow key={triage.id}>
              <TableCell>{triage.id}</TableCell>
              <TableCell>{triage.weight} kg</TableCell>
              <TableCell>{triage.height} cm</TableCell>
              <TableCell>{triage.systolic} mmHg</TableCell>
              <TableCell>{triage.diastolic} mmHg</TableCell>
              <TableCell>{triage.pulsets} bpm</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTriage(triage);
                    setOpenEdit(true);
                  }}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedTriage(triage);
                    setOpenDelete(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Triage Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Weight"
              value={selectedTriage?.weight ?? ""}
              onChange={(e) =>
                setSelectedTriage({
                  ...selectedTriage!,
                  weight: +e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Height"
              value={selectedTriage?.height ?? ""}
              onChange={(e) =>
                setSelectedTriage({
                  ...selectedTriage!,
                  height: +e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Systolic"
              value={selectedTriage?.systolic ?? ""}
              onChange={(e) =>
                setSelectedTriage({
                  ...selectedTriage!,
                  systolic: +e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Diastolic"
              value={selectedTriage?.diastolic ?? ""}
              onChange={(e) =>
                setSelectedTriage({
                  ...selectedTriage!,
                  diastolic: +e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Pulse"
              value={selectedTriage?.pulsets ?? ""}
              onChange={(e) =>
                setSelectedTriage({
                  ...selectedTriage!,
                  pulsets: +e.target.value,
                })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
