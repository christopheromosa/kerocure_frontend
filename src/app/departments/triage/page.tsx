"use client";
import {
  Server,
  ClipboardCheck,
  Settings,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  // Links for the dashboard cards
  const links = [
    { label: "Patients", href: "/departments/triage/patients", icon: Server },
    {
      label: "Reports",
      href: "/departments/triage/analytics",
      icon: ClipboardCheck,
    },
    { label: "Patients List", href: "/departments/patients", icon: Users },
    {
      label: "Visits",
      href: "/departments/admin/reports",
      icon: ClipboardList,
    },
    { label: "Profile", href: "/departments/triage/profile", icon: Settings },
  ];

  // Handle navigation when a card is clicked
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {links.map((link, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => handleNavigation(link.href)}
        >
          <CardHeader>
            <link.icon className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-xl font-semibold">
              {link.label}
            </CardTitle>
            <CardDescription>Navigate to {link.label} page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Go to {link.label}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
