import React from "react";
import Header from "./components/ui/Header.jsx";
import Home from "./pages/Home.jsx";
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'swiper/css';

function App() {
  return (
    <BrowserRouter>
      <main className="flex min-h-dvh flex-1 flex-col overflow-x-hidden bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] px-4 pb-0 pt-0">
        <Header />
        <div
          id="main-content"
          className="mx-auto mt-6 flex min-h-0 w-full max-w-6xl flex-1 flex-col scroll-mt-24 outline-none"
          tabIndex={-1}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}

export default App;