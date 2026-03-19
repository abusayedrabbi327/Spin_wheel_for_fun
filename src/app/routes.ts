import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

const lazyDashboardHome = async () => ({ Component: (await import("./components/dashboard/DashboardHome")).DashboardHome });
const lazyProgressPage = async () => ({ Component: (await import("./components/dashboard/ProgressPage")).ProgressPage });
const lazyAIGameCoachPage = async () => ({ Component: (await import("./components/dashboard/AIGameCoachPage")).AIGameCoachPage });
const lazyChallengesPage = async () => ({ Component: (await import("./components/dashboard/ChallengesPage")).ChallengesPage });
const lazyMyWheels = async () => ({ Component: (await import("./components/dashboard/MyWheels")).MyWheels });
const lazyCreateWheel = async () => ({ Component: (await import("./components/dashboard/CreateWheel")).CreateWheel });
const lazyCampaignDetail = async () => ({ Component: (await import("./components/dashboard/CampaignDetail")).CampaignDetail });
const lazySettingsPage = async () => ({ Component: (await import("./components/dashboard/SettingsPage")).SettingsPage });

const lazyAdminDashboard = async () => ({ Component: (await import("./components/admin/AdminDashboard")).AdminDashboard });
const lazyAdminUsers = async () => ({ Component: (await import("./components/admin/AdminUsers")).AdminUsers });
const lazyAdminWheels = async () => ({ Component: (await import("./components/admin/AdminWheels")).AdminWheels });
const lazyAdminAnalytics = async () => ({ Component: (await import("./components/admin/AdminAnalytics")).AdminAnalytics });
const lazyAdminEvents = async () => ({ Component: (await import("./components/admin/AdminEvents")).AdminEvents });
const lazyAdminSettings = async () => ({ Component: (await import("./components/admin/AdminSettings")).AdminSettings });

const lazyPublicSpinPage = async () => ({ Component: (await import("./components/spin/PublicSpinPage")).PublicSpinPage });

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, lazy: lazyDashboardHome },
      { path: "progress", lazy: lazyProgressPage },
      { path: "ai-coach", lazy: lazyAIGameCoachPage },
      { path: "challenges", lazy: lazyChallengesPage },
      { path: "wheels", lazy: lazyMyWheels },
      { path: "create", lazy: lazyCreateWheel },
      { path: "campaign/:id", lazy: lazyCampaignDetail },
      { path: "settings", lazy: lazySettingsPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, lazy: lazyAdminDashboard },
      { path: "users", lazy: lazyAdminUsers },
      { path: "wheels", lazy: lazyAdminWheels },
      { path: "analytics", lazy: lazyAdminAnalytics },
      { path: "events", lazy: lazyAdminEvents },
      { path: "settings", lazy: lazyAdminSettings },
    ],
  },
  {
    path: "/spin/:slug",
    lazy: lazyPublicSpinPage,
  },
]);
