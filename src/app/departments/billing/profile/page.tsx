"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import LoadingPage from "@/components/loading_animation";

interface StaffType {
  first_name?: string;
  last_name?: string;
  username?: string;
  role?: string;
  phone_number?: string;
  email?: string;
  authToken?: string;
}

export default function ProfilePage() {
  const { setTheme, theme } = useTheme();
  const { authState } = useAuth();
  const [staff, setStaff] = useState<StaffType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!authState?.token || !authState?.user_id) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/accounts/${authState.user_id}/`,
          {
            headers: {
              Authorization: `Token ${authState.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched staff data:", data);
        setStaff(data);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setStaff(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [authState?.token, authState?.user_id]);

  return (
    <PageTransition>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="w-full p-6">
          <Card className="w-full max-w-3xl mx-auto shadow-md p-6">
            <CardHeader className="flex justify-between gap-4 p-2">
              <CardTitle className="text-xl flex justify-between">
                Profile {/* Theme Toggle Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {staff ? (
                <>
                  <p>
                    <strong>First Name:</strong> {staff.first_name}{" "}
                  </p>
                  <p>
                    {" "}
                    <strong>Last Name:</strong> {staff.last_name}
                  </p>

                  <p>
                    <strong>Username:</strong> {staff.username}
                  </p>
                  <p>
                    <strong>Role:</strong> {staff.role}
                  </p>
                  <p>
                    <strong>Phone:</strong> {staff.phone_number}
                  </p>
                  <ResetPasswordDialog
                    apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/staff/reset-password/`}
                    authToken={authState?.token as string}
                    user_id={authState?.user_id}
                  />
                </>
              ) : (
                <p className="text-red-500">Failed to load profile data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageTransition>
  );
}
