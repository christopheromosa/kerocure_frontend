"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginForm() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();

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
      login(data.token, data.role, data.username, data.user_id);

      // Show success toast
      setTimeout(() => {
        toast.success("Login successful!");
      }, 500);

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "Triage") {
          router.push("/departments/triage");
        } else if (data.role === "Doctor") {
          router.push("/departments/consultation");
        } else if (data.role === "Lab Technician") {
          router.push("/departments/lab");
        } else if (data.role === "Pharmacist") {
          router.push("/departments/pharmacy");
        } else if (data.role === "Billing") {
          router.push("/departments/billing");
        } else if (data.role === "Administrator") {
          router.push("/departments/admin");
        }
      }, 1000);
    } catch (error) {
      // Show error toast
      toast.error(error instanceof Error ? error.message : "Login failed", {
        delay: 2000,
      });
    }
  }

  return (
    <div className="mb-6 w-full flex flex-col justify-center items-center  m-6 rounded-md mt-4">
      <Image
        src="/kerocureLogo-removebg-preview.png" // Ensure the image is inside the public folder
        alt="Company Logo"
        width={200} // Set width
        height={100} // Set height
        priority // Load it as a high priority
      />

      <div className="">
        <h1 className="text-xl">KEROCURE MEDICAL CENTER </h1>
      
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
