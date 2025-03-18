import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const MedicalHistoryTab = ({ visitData }: any) => {
  const { authState } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(true); // Track if it's a new record

  // Fetch medical history data from the backend
  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        if (visitData?.consultation_data?.note_id) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
            {
              headers: {
                Authorization: `Token ${authState?.token}`,
              },
            }
          );
          if (response.data.medical_history) {
            setSections(response.data.medical_history); // Set existing medical history
            setIsNewRecord(false); // It's an existing record
          }
        } else {
          setSections([]); // Initialize with empty sections if no note_id exists
          setIsNewRecord(true); // It's a new record
        }
      } catch (error) {
        console.error("Failed to fetch medical history:", error);
      }
    };

    fetchMedicalHistory();
  }, [authState?.token, visitData?.consultation_data?.note_id]);

  // Add a new section
  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSection = { title: newSectionTitle, content: "" };
      setSections([...sections, newSection]); // Append new section to existing sections
      setNewSectionTitle("");
      setIsDialogOpen(false);
    }
  };

  // Update the content of a section
  const handleSectionContentChange = (index: number, content: string) => {
    const updatedSections = [...sections];
    updatedSections[index].content = content;
    setSections(updatedSections);
  };

  // Delete a section
  const handleDeleteSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index); // Remove the section at the specified index
    setSections(updatedSections);
  };

  // Save medical history to the backend
  const handleSaveMedicalHistory = async () => {
    try {
      const payload = {
        medical_history: sections,
        visit: visitData?.visit_id, // Include visit ID in the payload
        physician: authState?.user_id, // Include physician ID in the payload
      };

      if (isNewRecord) {
        // Create a new consultation record
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Medical history created successfully!",{autoClose:1000});
        window.location.reload()
        setIsNewRecord(false); // Update state to reflect that it's no longer a new record
      } else {
        // Update the existing consultation record
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Medical history updated successfully!",{autoClose:1000});
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to save medical history:", error);
      toast.error("Failed to save medical history. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Dialog for adding new sections */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">Add New Section</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Section Title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
            <Button onClick={handleAddSection}>Add Section</Button>
          </DialogContent>
        </Dialog>

        {/* Display existing sections with delete button */}
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteSection(index)}
              >
                Delete
              </Button>
            </div>
            <Textarea
              value={section.content}
              onChange={(e) => handleSectionContentChange(index, e.target.value)}
              placeholder={`Enter ${section.title} notes...`}
            />
          </div>
        ))}

        {/* Save button with dynamic text */}
        <Button onClick={handleSaveMedicalHistory} className="mt-4">
          {isNewRecord ? "Save Medical History" : "Update Medical History"}
        </Button>
        <ToastContainer />
      </CardContent>
    </Card>
  );
};
