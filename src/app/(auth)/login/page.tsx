"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";



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


const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginForm() {
    const { setTheme,theme } = useTheme();
    const router = useRouter();
    const {login } = useAuth();
    
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
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(credentials);
    
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.non_field_errors[0] || "Login failed");
      }
      const data = await response.json();
      login(data.token, data.role, data.username, data.user_id);
      //Redirect based on role
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
      } else if (data.role === "administrator") {
        router.push("/departments/admin");
      }
    }
    catch (error) { 
      console.error(error);     
      alert(error);
    }
    
  }

  return (
    <div className="mb-6 w-full flex flex-col justify-center items-center border m-6 rounded-md">
      {theme === "light" ? (
        <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
          <Sun
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            onClick={() => setTheme("light")}
          />
        </Button>
      ) : (
        <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            onClick={() => setTheme("dark")}
          />
        </Button>
      )}
      <h1 className="text-xl">KEROCURE MEDICAL CENTER</h1>
      <h2>LOGIN</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 border rounded-md p-8 w-1/3"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="enter username" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}


