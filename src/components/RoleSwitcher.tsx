"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleRoutes = {
  Triage: "/departments/triage",
  Doctor: "/departments/consultation",
  "Lab Technician": "/departments/lab",
  Pharmacist: "/departments/pharmacy",
  Billing: "/departments/billing",
  Administrator: "/departments/admin",
};

export const RoleSwitcher = () => {
  const { authState, setCurrentRole } = useAuth();
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const router = useRouter();
  useEffect(() => {
    setAvailableRoles(authState.roles.split(","));
  }, [authState.roles]);

  const handleSwitch = (role: string) => {
    setCurrentRole(role);
    router.push(roleRoutes[role as keyof typeof roleRoutes] || "/");
  };

  if (!authState.roles || authState.roles.length <= 1) return null;
  console.log(typeof authState.roles);

  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1">
          <span>{authState.currentRole}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitch(role)}
            className={role === authState.currentRole ? "bg-gray-100" : ""}
          >
            {role}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
