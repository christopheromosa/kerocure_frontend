"use client";

import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppAdminSidebar } from "@/components/app-admin-sidebar";
import {
  Stethoscope,
  UserCheck,
  LayoutDashboard,
  Heart,
  Briefcase,
  Microscope,
  ShoppingBag,
  Pill,
  Activity,
  FlaskConical,
  Settings,
  Users,
  CreditCard,
  Building,
  ClipboardList
  
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const links = [
    {
      section: "Core Navigation",
      items: [
        {
          label: "Dashboard",
          href: "/departments/admin/",
          icon: LayoutDashboard,
        },
        {
          label: "Visits",
          href: "/departments/admin/visits",
          icon: Users,
        },
        {
          label: "Patients",
          href: "/departments/admin/patients",
          icon: Stethoscope,
        },
      ],
    },
    {
      section: "Clinical Departments",
      items: [
        {
          label: "Triage",
          href: "/departments/admin/triage",
          icon: Heart,
        },
        {
          label: "Consultation",
          href: "/departments/admin/consultation",
          icon: Briefcase,
        },
        {
          label: "Laboratory",
          href: "/departments/admin/laboratory",
          icon: Microscope,
        },
        {
          label: "Pharmacy",
          href: "/departments/admin/pharmacy",
          icon: ShoppingBag,
        },
      ],
    },
    {
      section: "Financial Management",
      items: [
        {
          label: "Drug Sales",
          href: "/departments/admin/drugSales",
          icon: ShoppingBag,
        },
        {
          label: "Lab Sales",
          href: "/departments/admin/labSales",
          icon: FlaskConical,
        },
        {
          label: "Billing",
          href: "/departments/admin/billing",
          icon: CreditCard,
        },
      ],
    },
    {
      section: "Administrative Sections",
      items: [
        {
          label: "Drugs",
          href: "/departments/admin/drugs",
          icon: Pill,
        },
        {
          label: "Diseases",
          href: "/departments/admin/diseases",
          icon: Activity,
        },
        {
          label: "Departments",
          href: "/departments/admin/departments",
          icon: Building,
        },
        {
          label: "Lab Tests",
          href: "/departments/admin/labtests",
          icon: FlaskConical,
        },
      ],
    },
    {
      section: "Reporting",
      items: [
        {
          label: "Reports",
          href: "/departments/admin/reports",
          icon: ClipboardList,
        },
      ],
    },
    {
      section: "Staff Management",
      items: [
        {
          label: "Staff",
          href: "/departments/admin/staff",
          icon: UserCheck,
        },
      ],
    },
    {
      section: "Settings",
      items: [
        {
          label: "Profile",
          href: "/departments/admin/profile",
          icon: Settings,
        },
      ],
    },
  ];

  const pathname = usePathname();
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardProvider>
          <SidebarProvider>
            <AppAdminSidebar links={links} />
            <SidebarInset>
              <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard">
                          Kerocure-admin
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{pathname}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </DashboardProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
