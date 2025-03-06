"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginForm() {
  const router = useRouter();
  const { login, authState } = useAuth();
  const [showRoleDialog, setShowRoleDialog] = useState<boolean>(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(credentials: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.non_field_errors[0] || "Login failed");
      }

      const data = await response.json();
      console.log(data);



      // Login the user
      login(
        data.token,
        data.roles,
        data.username,
        data.user_id,
        data.is_active
      );

            // Check if the account is active
      if (data.is_active === "false") {
        toast.error(
          "Your account is suspended. Please contact the administrator."
        );
        return;
      }

      
        const roles = data.roles.includes(",")
          ? data.roles.split(",")
          : [data.roles];
      // Check if the user has multiple roles
      if (roles.length > 1) {
        setAvailableRoles(data.roles.split(",")); // Set available roles
        setShowRoleDialog(true); // Show role selection dialog
        
      } else {
        // Redirect based on the single role

        redirectUser(roles[0]);
        
      }
      
    } catch (error) {
      // Show error toast
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  }

  // Function to redirect the user based on their role
  const redirectUser = (role: string) => {
    console.log(role);
    switch (role) {
      case "Triage":
        router.push("/departments/triage");
        break;
      case "Doctor":
        router.push("/departments/consultation");
        break;
      case "Lab Technician":
        router.push("/departments/lab");
        break;
      case "Pharmacist":
        router.push("/departments/pharmacy");
        break;
      case "Billing":
        router.push("/departments/billing");
        break;
      case "Administrator":
        router.push("/departments/admin");
        break;
      default:
        router.push("/");
    }
    // Show success toast
            toast.success("Login successful!",{autoClose: 1000,});
  };

  // Function to handle role selection
  const handleRoleSelection = (role: string) => {
    setShowRoleDialog(false); // Close the dialog
    redirectUser(role); // Redirect based on the selected role
  };

  return (
    <div className="mb-6 w-full flex flex-col justify-center items-center m-6 rounded-md mt-4">
      <Image
        src="/kerocureLogo-removebg-preview.png"
        alt="Company Logo"
        width={200}
        height={100}
        priority
      />

      <div className="">
        <h1 className="text-xl">KEROCURE MEDICAL CENTER</h1>
      </div>

      {/* Login Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 border rounded-md p-8 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-400">Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-400">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Role</DialogTitle>
            <DialogDescription>
              You have multiple roles. Please select the role you want to use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <Button
                key={role}
                onClick={() => handleRoleSelection(role)}
                className="w-full"
              >
                {role}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
