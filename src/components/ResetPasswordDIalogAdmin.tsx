"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Staff } from "@/app/departments/admin/staff/page";
import { useState } from "react";
import { Input } from "./ui/input";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStaff: Staff | null;
  onResetPassword: (newPassword: string) => void;
}

export const ResetPasswordDialog = ({
  isOpen,
  onOpenChange,
  selectedStaff,
  onResetPassword,
}: ResetPasswordDialogProps) => {
  const [newPassword, setNewPassword] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {selectedStaff?.username}.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600 text-white dark:text-white"
          onClick={() => onResetPassword(newPassword)}
        >
          Reset Password
        </Button>
      </DialogContent>
    </Dialog>
  );
};
