"use client"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Users, LayoutDashboard,Server,ClipboardCheck,Settings } from "lucide-react";
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
import { VisitProvider } from "@/context/VisitContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "",
      icon: LayoutDashboard,
    },
    { label: "patients", href: "/departments/billing", icon: Server },
    { label: "reports", href: "/departments/billing/analytics", icon: ClipboardCheck },
     { label: "profile", href: "/departments/billing/profile", icon: Settings },
  ];
  const pathname = usePathname();
  return (
    <VisitProvider>
    <AuthProvider>
    <SidebarProvider>
      <AppSidebar links={links} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Kerocure-Billing
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
        <main className="h-full bg-background border p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
   </AuthProvider>
  </VisitProvider>
  );
}
