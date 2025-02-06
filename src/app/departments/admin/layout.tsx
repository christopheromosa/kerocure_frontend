
"use client"


import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Stethoscope,UserCheck, LayoutDashboard, FileText, Heart, Briefcase, Microscope, ShoppingBag, DollarSign } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    const links = [
        { label: "Dashboard", href: "/departments/admin/", icon: LayoutDashboard },
        { label: "Staff", href: "/departments/admin/staff", icon: UserCheck },
        { label: "Patients", href: "/departments/admin/patients", icon: Stethoscope },
        { label: "Triage", href: "/departments/admin/triage", icon: Heart },
        { label: "Consultation", href: "/departments/admin/consultation", icon: Briefcase },
        { label: "Laboratory", href: "/departments/admin/laboratory", icon: Microscope },
        { label: "Pharmacy", href: "/departments/admin/pharmacy", icon: ShoppingBag },
        { label: "Billing", href: "/departments/admin/billing", icon: DollarSign }, // Replaced FileMoney with DollarSign
        
      ];
    
  const pathname = usePathname();
  return (
    <AuthProvider>
     <QueryClientProvider client={queryClient}>
      <DashboardProvider>
        <SidebarProvider>
          <AppSidebar links={links} />
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
