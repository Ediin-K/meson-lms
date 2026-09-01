import { NavLink } from "react-router-dom";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`
    }
  >
    <Icon fontSize="small" />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </NavLink>
);

export default function DepartmentHeadSidebar() {
  const links = [
    { to: "/department-head", icon: DashboardRounded, label: "Dashboard" },
    { to: "/department-head/subjects", icon: AutoStoriesRounded, label: "Subjects" },
    { to: "/department-head/teachers", icon: SchoolRounded, label: "Teachers" },
    { to: "/department-head/students", icon: PeopleRounded, label: "Students" },
    { to: "/department-head/attendance", icon: EventAvailableRounded, label: "Attendance" },
    { to: "/department-head/grade-audit-log", icon: HistoryRounded, label: "Grade Audit" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md h-[calc(100vh-80px)] sticky top-20 hidden md:block">
      <div className="p-6 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">
          Department Head Menu
        </p>
        {links.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </div>
    </aside>
  );
}
