import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLogout, useAuth } from "@/lib/AuthProvider";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogIn, 
  History, 
  Settings, 
  LogOut,
  Menu,
  User
} from "lucide-react";
import { CoinIcon } from "../icons/gaming-icons";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const logout = useLogout();
  const { user } = useAuth();

  const navItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Tạo Giao Dịch",
      href: "/create-room",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      title: "Tham Gia Giao Dịch",
      href: "/join-room",
      icon: <LogIn className="w-5 h-5" />,
    },
    {
      title: "Lịch Sử Giao Dịch",
      href: "/history",
      icon: <History className="w-5 h-5" />,
    },
    {
      title: "Cài Đặt",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="bg-sidebar text-sidebar-foreground w-full md:w-64 md:min-h-screen border-r-2 border-sidebar-border">
        <div className="flex items-center justify-between md:justify-center p-4">
          <h1 className="font-pixel text-sidebar-primary text-lg">PIXELStrade</h1>
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="text-sidebar-foreground md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className={cn("md:block", mobileOpen ? "block" : "hidden")}>
          <div className="p-4">
            <div className="bg-sidebar-accent/10 rounded-lg p-3 flex items-center">
              <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground">
                <User className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sidebar-foreground font-medium">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/70">Cấp độ: Người dùng</p>
              </div>
            </div>
            
            <div className="flex justify-end items-center mt-2">
              <div className="bg-card/30 p-2 rounded-lg flex items-center">
                <CoinIcon className="w-4 h-4 text-warning mr-1" />
                <span className="text-secondary">{user?.balance || 0} xu</span>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 p-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sidebar-foreground rounded-md transition-colors",
                    location === item.href
                      ? "bg-sidebar-primary/20 text-sidebar-primary"
                      : "hover:bg-sidebar-primary/10"
                  )}
                >
                  <span className="w-5 text-center mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="mt-6 pt-6 border-t border-sidebar-border p-2">
            <button 
              onClick={() => logout()}
              className="flex items-center px-3 py-2 text-sidebar-foreground rounded-md hover:bg-destructive/20 w-full"
            >
              <span className="w-5 text-center mr-3">
                <LogOut className="w-5 h-5" />
              </span>
              <span>Đăng Xuất</span>
            </button>
          </div>
          
          <div className="p-4 md:hidden flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4">
        {children}
      </div>
    </div>
  );
}
