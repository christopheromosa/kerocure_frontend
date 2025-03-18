import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideIcon, LogOut } from "lucide-react"; // Import LogOut icon
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation"; // Import useRouter for navigation after logout
import { useAuth } from "@/context/AuthContext";
import { Badge } from "./ui/badge";

interface SidebarProps {
  links: {
    section?: string; // Optional section header
    items: { label: string; href: string; icon?: LucideIcon }[];
  }[];
}

export function AppAdminSidebar({ links }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { authState } = useAuth();

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();
    // Redirect to login page
    router.push("/login");
  };

  return (
    <Sidebar className="bg-[#1e293b] text-white h-screen flex flex-col">
      <SidebarContent className="flex-1">
        {/* Dashboard Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-white p-4 border-b border-gray-700">
            Kerocure Dashboard
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Grouped Links */}
        {links.map((group, index) => (
          <SidebarGroup key={index}>
            {/* Section Header (if provided) */}
            {group.section && (
              <SidebarGroupLabel className="text-sm font-medium text-gray-400 uppercase px-4 py-2">
                {group.section}
              </SidebarGroupLabel>
            )}

            {/* Section Links */}
            <SidebarGroupContent className="p-2">
              <SidebarMenu className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200",
                          pathname === href
                            ? "bg-blue-600 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        )}
                      >
                        {Icon && <Icon size={20} className="flex-shrink-0" />}
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700 flex flex-col">
        <Badge className="text-center p-2 mb-1 font-semibold">
          <strong>@{authState?.username}</strong>
        </Badge>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </Sidebar>
  );
}
