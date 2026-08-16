import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/dashboard/TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <TeacherSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
