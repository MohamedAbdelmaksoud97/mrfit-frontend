import { Link, useLocation } from "react-router-dom";
import { Dumbbell, LayoutDashboard, Salad, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Workout" },
  { to: "/nutrition", icon: Salad, label: "Nutrition" },
  { to: "/profile", icon: User, label: "Profile" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-electric flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">MrFit</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "gap-2",
                  location.pathname === item.to && "bg-primary/10 text-primary"
                )}
              >
                <Link to={item.to}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={() => authService.logout()} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs transition-colors",
                location.pathname === item.to ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="pt-14 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
