import { Outlet } from "react-router-dom";
import DepartmentHeadSidebar from "../components/dashboard/DepartmentHeadSidebar";

export default function DepartmentHeadLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DepartmentHeadSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
