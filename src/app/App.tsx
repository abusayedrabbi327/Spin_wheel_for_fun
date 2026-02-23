import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  return (
    <div className="size-full">
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </div>
  );
}
