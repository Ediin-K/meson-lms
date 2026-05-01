import React from "react";
import Home from "./pages/Home.jsx";
import Header from "./components/ui/Header.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import LessonDetail from './pages/LessonDetail.jsx';
import Contact from './pages/ContactUs.jsx';
import SemesterPage from './pages/SemesterPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'swiper/css';
import StudentDashboard from "./components/dashboard/StudentDashboard.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TeacherDashboard from "./components/dashboard/TeacherDashboard.jsx";


function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header/>
        <main className="flex flex-col flex-grow">
          <div
            id="main-content"
            className="flex flex-col flex-grow pt-[73px] sm:pt-[81px]"
            tabIndex={-1}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/student/semester/:semesterId" element={<SemesterPage />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/lesson/:lessonId" element={<LessonDetail />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/student" element={ <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>} />
              <Route path="/teacher" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Home />} />
              <Route path="/unauthorized" element={<div>Nuk ke qasje!</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;