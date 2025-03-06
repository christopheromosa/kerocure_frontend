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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface StaffType {
  first_name?: string;
  last_name?: string;
  username?: string;
  roles?: string[];
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
          <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-white">
                  Profile
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {staff ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${staff.first_name}+${staff.last_name}&background=random`}
                      />
                      <AvatarFallback>
                        {staff.first_name?.charAt(0)}
                        {staff.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">
                      {staff.first_name} {staff.last_name}
                    </h3>
                    <p className="text-muted-foreground">@{staff.username}</p>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Roles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {staff.roles?.map((role, index) => (
                          <Badge key={index} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Contact Information
                      </h4>
                      <p className="text-sm">{staff.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.email}
                      </p>
                    </div>

                    {/* Reset Password Button */}
                    <ResetPasswordDialog
                      apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/staff/reset-password/`}
                      authToken={authState?.token as string}
                      user_id={authState?.user_id}
                    />
                  </div>
                </div>
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
