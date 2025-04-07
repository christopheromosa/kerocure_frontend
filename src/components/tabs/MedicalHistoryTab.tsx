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

// Custom auto-resizing Textarea component
const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ value, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className="min-h-[60px] resize-none"
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export const MedicalHistoryTab = ({ visitData }: any) => {
  const { authState } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [hasEdits, setHasEdits] = useState(false); // Track if edits have been made

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
            setSections(response.data.medical_history);
            setIsNewRecord(false);
          }
        } else {
          setSections([]);
          setIsNewRecord(true);
        }
      } catch (error) {
        console.error("Failed to fetch medical history:", error);
      }
    };

    fetchMedicalHistory();
  }, [authState?.token, visitData?.consultation_data?.note_id]);

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSection = { title: newSectionTitle, content: "" };
      setSections([...sections, newSection]);
      setNewSectionTitle("");
      setIsDialogOpen(false);
      setHasEdits(true); // Mark as edited when adding new section
    }
  };

  const handleSectionContentChange = (index: number, content: string) => {
    const updatedSections = [...sections];
    updatedSections[index].content = content;
    setSections(updatedSections);
    setHasEdits(true); // Mark that edits have been made
  };

  const handleDeleteSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
    setHasEdits(true); // Mark as edited when deleting section
  };

  const handleSaveMedicalHistory = async () => {
    try {
      const payload = {
        medical_history: sections,
        visit: visitData?.visit_id,
        physician: authState?.user_id,
      };

      if (isNewRecord) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Medical history created successfully!", {
          autoClose: 1000,
        });
        setIsNewRecord(false);
      } else {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/consultation/${visitData?.consultation_data?.note_id}/`,
          payload,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        toast.success("Medical history updated successfully!", {
          autoClose: 1000,
        });
      }
      setHasEdits(false); // Reset edit state after successful save
      window.location.reload();
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
            <AutoResizeTextarea
              value={section.content}
              onChange={(e) =>
                handleSectionContentChange(index, e.target.value)
              }
              placeholder={`Enter ${section.title} notes...`}
            />
          </div>
        ))}

        <Button
          onClick={handleSaveMedicalHistory}
          className="mt-4"
          variant={hasEdits ? "default" : "secondary"}
        >
          {isNewRecord
            ? "Save Medical History"
            : hasEdits
            ? "Save Changes"
            : "Medical History Saved"}
        </Button>
        <ToastContainer />
      </CardContent>
    </Card>
  );
};
