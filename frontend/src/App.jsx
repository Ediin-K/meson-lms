import React from "react";
import Home from "./pages/Home.jsx";
import Header from "./components/ui/Header.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Contact from './pages/ContactUs.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'swiper/css';

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <main className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div
          id="main-content"
          className="flex min-h-dvh flex-col bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;