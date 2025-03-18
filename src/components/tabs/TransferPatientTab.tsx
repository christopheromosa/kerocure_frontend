import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";

interface DepartmentType {
  id: number;
  name: string;
}

export const TransferPatientTab = ({
  visitId,
  authState,
  onTransferSuccess,
  visitData,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [transferHistory, setTransferHistory] = useState(
    visitData?.transfer_history || []
  );
  const [isTransferring, setIsTransferring] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/`,
          {
            headers: {
              Authorization: `Token ${authState?.token}`,
            },
          }
        );
        setDepartments(res.data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Failed to fetch departments. Please try again.");
      }
    };
    fetchDepartments();
  }, [authState?.token]);

  // Handle transfer
  const handleTransfer = async () => {
    setIsTransferring(true); // Start loading
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transfer-patient/`,
        {
          visit_id: visitId,
          new_department_id: newDepartmentId,
          referral_reason: referralReason,
          transferred_by: `${authState?.first_name} ${authState?.last_name}`,
        },
        {
          headers: {
            Authorization: `Token ${authState?.token}`,
          },
        }
      );

      setTransferHistory(response.data.transfer_history);
      setIsModalOpen(false);
      setIsConfirmationOpen(false);
      onTransferSuccess();
      toast.success("Patient transferred successfully!");
    } catch (error) {
      console.error("Failed to transfer patient:", error);
      toast.error("Failed to transfer patient. Please try again.");
    } finally {
      setIsTransferring(false); // Stop loading
    }
  };

  const handleTransferClick = () => {
    if (!newDepartmentId || !referralReason) {
      toast.error("Please select a department and provide a reason.");
      return;
    }
    setIsConfirmationOpen(true); // Open confirmation dialog
  };

  return (
    <div className="space-y-6">
      {/* Transfer Patient Button */}
      <Button onClick={() => setIsModalOpen(true)}>Transfer Patient</Button>

      {/* Transfer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
          </DialogHeader>
          <div>
            <Label>New Department</Label>
            <Select onValueChange={(value) => setNewDepartmentId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reason for Transfer</Label>
            <Input
              type="text"
              value={referralReason}
              onChange={(e) => setReferralReason(e.target.value)}
              placeholder="Enter reason for transfer"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleTransferClick}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to transfer the patient to the selected department?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer History Table */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">Transfer History</h3>
        {visitData?.transfer_history?.length > 0 ? (
          <Table>
            <TableCaption>
              List of department transfers for this visit.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>From Department</TableHead>
                <TableHead>To Department</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Transferred By</TableHead>
                <TableHead>Transferred At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitData.transfer_history.map((transfer: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{transfer.from_department}</TableCell>
                  <TableCell>{transfer.to_department}</TableCell>
                  <TableCell>{transfer.reason}</TableCell>
                  <TableCell>{transfer.transferred_by}</TableCell>
                  <TableCell>
                    {new Date(transfer.transferred_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No transfer history available.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default TransferPatientTab;
