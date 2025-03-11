"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  LayoutDashboard,
  ClipboardCheck,
  Server,
  Microscope,
  Settings,
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
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { VisitProvider } from "@/context/VisitContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "/departments/consultation",
      icon: LayoutDashboard,
    },
    {
      label: "Patients in Queue",
      href: "/departments/consultation/patients",
      icon: Server,
    },
    {
      label: "Patients from Lab",
      href: "/departments/consultation/lab",
      icon: Microscope,
    },
    {
      label: "Task completed",
      href: "/departments/consultation/analytics",
      icon: ClipboardCheck,
    },
    {
      label: "Profile",
      href: "/departments/consultation/profile",
      icon: Settings,
    },
  ];
  const pathname = usePathname();
  const { authState } = useAuth();
  return (
    <AuthProvider>
      <VisitProvider>
        <SidebarProvider>
          <AppSidebar links={links} />
          <SidebarInset>
            <header className="flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/departments/consultation">
                        Kerocure-consultation
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pathname}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-3 p-3  rounded-lg shadow-md  hover:shadow-lg transition-shadow duration-300">
                <span className="text-lg font-semibold">
                  👋 Welcome,{" "}
                  <span className="text-blue-600">
                    {authState?.first_name} {authState?.last_name}
                  </span>
                  !
                </span>
              </div>
            </header>
            <main className="h-full bg-background border p-4">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </VisitProvider>
    </AuthProvider>
  );
}
