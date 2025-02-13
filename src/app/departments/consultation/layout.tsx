"use client"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Users, LayoutDashboard,ClipboardCheck,Server,Microscope,Settings } from "lucide-react";
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
    { label: "patients", href: "/departments/consultation", icon: Server },
    { label: "Lab", href: "/departments/consultation/lab", icon: Microscope },
    { label: "task completed", href: "/departments/consultation/analytics", icon: ClipboardCheck },
       { label: "profile", href: "/departments/consultation/profile", icon: Settings },
  ];
  const pathname = usePathname();
  return (
    <AuthProvider>
      <VisitProvider>
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
            </header>
            <main className="h-full bg-background border p-4">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </VisitProvider>
    </AuthProvider>
  );
}
