"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

interface ResetPasswordDialogProps {
  apiUrl: string; // API endpoint for resetting password
  authToken: string; // Authorization token
  user_id:number | null;
}

export default function ResetPasswordDialog({ apiUrl, authToken,user_id }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
    const router = useRouter();


  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword,user:user_id }),
      });

      const data = await response.json();
      if (response.ok) {
         toast.success("Password reset successful ", {
           autoClose: 5000, // Show toast for 2 seconds
           onClose: () => {
             window.location.reload(); // Refresh after the toast disappears
           },
         });
        router.push("/");
        
        
      } else {
        toast.error("Failed to reset password");
      }
    } catch (error) {
      toast.error( "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">Reset Password</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto"> {/* Centered within the profile card */}
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button onClick={handlePasswordReset} disabled={loading} className="w-full">
                {loading ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
  );
}
