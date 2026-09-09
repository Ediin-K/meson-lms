import { NavLink } from "react-router-dom";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ViewModuleRounded from "@mui/icons-material/ViewModuleRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import GradeRounded from "@mui/icons-material/GradeRounded";
import FactCheckRounded from "@mui/icons-material/FactCheckRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";

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

export default function TeacherSidebar() {
  const links = [
    { to: "/teacher", icon: DashboardRounded, label: "Dashboard" },
    { to: "/teacher/subjects", icon: SchoolRounded, label: "My subjects" },
    { to: "/teacher/modules", icon: ViewModuleRounded, label: "Modules" },
    { to: "/teacher/lessons", icon: MenuBookRounded, label: "Lessons" },
    { to: "/teacher/quizzes", icon: QuizRounded, label: "Quizzes" },
    { to: "/teacher/assignments", icon: AssignmentRounded, label: "Detyrat" },
    { to: "/teacher/students", icon: PeopleRounded, label: "Students" },
    { to: "/teacher/sections", icon: GroupsRounded, label: "Seksionet e mia" },
    { to: "/teacher/grades", icon: GradeRounded, label: "Notat" },
    { to: "/teacher/attendance", icon: EventAvailableRounded, label: "Prezenca" },
    { to: "/teacher/grade-audit-log", icon: HistoryRounded, label: "Historiku i Notave" },
    { to: "/teacher/smis/exams", icon: FactCheckRounded, label: "Provimet SMIS" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_-1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)] h-[calc(100vh-80px)] sticky top-20 hidden md:block">
      <div className="p-6 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">
          Menu e Profesorit
        </p>
        {links.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </div>
    </aside>
  );
}
