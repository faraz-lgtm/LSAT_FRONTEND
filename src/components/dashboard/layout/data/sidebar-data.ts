import {
  Construction,
  LayoutDashboard,
  Bug,
  FileX,
  HelpCircle,
  Lock,
  Package,
  ServerOff,
  UserX,
  Users,
  ShieldCheck,
  Command,
  GalleryVerticalEnd,
  Calendar,
  CalendarCheck,
  ClipboardList,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  ReceiptText,
  CreditCard,
  Zap,
  Activity,
  Building2,
  MessagesSquare,
} from "lucide-react";
import { ClerkLogo } from "@/assets/clerk-logo";
import { type SidebarData } from "../types";
const ENV = import.meta.env.VITE_ENV;

const sidebarData: SidebarData = {
  // user field removed - now handled by NavUser component via Redux
  teams: [
    {
      name: "BetterLSAT",
      logo: Command,
      plan: "Scalebrands.ca",
    },
    {
      name: "BetterMCAT",
      logo: GalleryVerticalEnd,
      plan: "Scalebrands.ca",
    },
  ],
  navGroups: [
    {
      title: "Super Admin",
      items: [
        {
          title: "Dashboard",
          url: "/super-admin/dashboard",
          icon: LayoutDashboard,
          superAdminOnly: true,
        },
        {
          title: "Organizations",
          url: "/super-admin/organizations",
          icon: Building2,
          superAdminOnly: true,
        },
        {
          title: "Integrations Usage",
          url: "/super-admin/usage",
          icon: Activity,
          superAdminOnly: true,
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
          hideForSuperAdmin: true,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: ClipboardList,
          hideForSuperAdmin: true,
        },
        {
          title: "Appointments",
          url: "/appointments",
          icon: CalendarCheck,
          hideForSuperAdmin: true,
        },
        {
          title: "Apps",
          url: "/apps",
          icon: Package,
          hideForSuperAdmin: true,
        },
        {
          title: "Chats",
          url: "/chats",
          icon: MessagesSquare,
          hideForSuperAdmin: true,
        },
        
        {
          title: "Orders",
          url: "/orders",
          icon: ShoppingCart,
          hideForSuperAdmin: true,
        },
        {
          title: "Cart",
          url: import.meta.env.VITE_CART_ || "/cart",
          icon: ShoppingBag,
          hideForSuperAdmin: true,
        },
        {
          title: "Packages",
          url: "/packages",
          icon: Package,
          hideForSuperAdmin: true,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: Calendar,
          hideForSuperAdmin: true,
        },
      ],
    },
    {
      title: "Users",
      items: [
        { title: "Employees", url: "/users/employees", icon: Users, hideForSuperAdmin: true },
        { title: "Leads", url: "/users/leads", icon: Users, hideForSuperAdmin: true },
        { title: "Contacts", url: "/users/contacts", icon: Users, hideForSuperAdmin: true },
        { title: "Customers", url: "/users/customers", icon: Users, hideForSuperAdmin: true },
      ],
    },
    {
      title: "Automations",
      items: [
        {
          title: "Automations",
          url: "/automations",
          icon: Zap,
          hideForSuperAdmin: true,
        },
        {
          title: "Automation Logs",
          url: "/automation-logs",
          icon: Activity,
          hideForSuperAdmin: true,
        },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          title: "Invoices",
          url: "/invoices",
          icon: Receipt,
          hideForSuperAdmin: true,
        },
        {
          title: "Refunds",
          url: "/refunds",
          icon: ReceiptText,
          hideForSuperAdmin: true,
        },
        {
          title: "Transactions",
          url: "/transactions",
          icon: CreditCard,
          hideForSuperAdmin: true,
        },
        {
          title: "Secured by Clerk",
          icon: ClerkLogo,
          items: [
            {
              title: "Sign In",
              url: "/clerk/sign-in",
            },
            {
              title: "User Management",
              url: "/clerk/user-management",
            },
          ],
        },
      ],
    },
    {
      title: "Pages",
      items: [
        {
          title: "Auth",
          icon: ShieldCheck,
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Sign In (2 Col)",
              url: "/sign-in-2",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
        {
          title: "Errors",
          icon: Bug,
          items: [
            {
              title: "Unauthorized",
              url: "/errors/unauthorized",
              icon: Lock,
            },
            {
              title: "Forbidden",
              url: "/errors/forbidden",
              icon: UserX,
            },
            {
              title: "Not Found",
              url: "/errors/not-found",
              icon: FileX,
            },
            {
              title: "Internal Server Error",
              url: "/errors/internal-server-error",
              icon: ServerOff,
            },
            {
              title: "Maintenance Error",
              url: "/errors/maintenance-error",
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: "Other",
      items: [
        {
          title: "Help Center",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
};

console.log("ENV", ENV);

if (ENV !== "DEVELOPMENT") {
  // Filter navGroups to only show production-ready pages
  const cartUrl = import.meta.env.VITE_CART_ || "http://booking.betterlsat.com"
  sidebarData.navGroups = sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // Allow items with direct URLs
        if (item.url && [
          "/", 
          "/super-admin/dashboard",
          "/super-admin/organizations",
          "/super-admin/usage",
          "/users", 
          "/users/employees",
          "/users/leads",
          "/users/contacts",
          "/users/customers",
          "/orders", 
          "/calendar", 
          "/packages",
          "/help-center",
          "/tasks",
          "/appointments",
          "/chats",
          "/invoices",
          "/refunds",
          "/transactions",
          "/automations",
          "/automation-logs",
          cartUrl
        ].includes(item.url)) {
          return true;
        }
        return false;
      }),
    }))
    .filter((group) => group.items.length > 0);
}


export { sidebarData };