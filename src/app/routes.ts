import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { CreateWheel } from "./components/dashboard/CreateWheel";
import { MyWheels } from "./components/dashboard/MyWheels";
import { ProgressPage } from "./components/dashboard/ProgressPage";
import { ChallengesPage } from "./components/dashboard/ChallengesPage";
import { CampaignDetail } from "./components/dashboard/CampaignDetail";
import { SettingsPage } from "./components/dashboard/SettingsPage";
import { PublicSpinPage } from "./components/spin/PublicSpinPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminUsers } from "./components/admin/AdminUsers";
import { AdminWheels } from "./components/admin/AdminWheels";
import { AdminAnalytics } from "./components/admin/AdminAnalytics";
import { AdminEvents } from "./components/admin/AdminEvents";
import { AdminSettings } from "./components/admin/AdminSettings";

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
      { index: true, Component: DashboardHome },
      { path: "progress", Component: ProgressPage },
      { path: "challenges", Component: ChallengesPage },
      { path: "wheels", Component: MyWheels },
      { path: "create", Component: CreateWheel },
      { path: "campaign/:id", Component: CampaignDetail },
      { path: "settings", Component: SettingsPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "wheels", Component: AdminWheels },
      { path: "analytics", Component: AdminAnalytics },
      { path: "events", Component: AdminEvents },
      { path: "settings", Component: AdminSettings },
    ],
  },
  {
    path: "/spin/:slug",
    Component: PublicSpinPage,
  },
]);
