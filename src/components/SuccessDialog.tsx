"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setTimeout(onClose, 1500); // Auto-close after 1.5s
      }, 2000); // Simulate loading for 2s
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col items-center justify-center p-6">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-3 text-gray-600">Saving data...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="mt-3 text-green-600">Saved successfully!</p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
