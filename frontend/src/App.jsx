import Header from "./components/ui/Header.jsx";
import Home from "./pages/Home.jsx";
import 'swiper/css';
function App() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col overflow-x-hidden bg-gradient-to-b from-sky-50 via-[#f0f7fb] to-[#d8e8f2] px-4 pb-0 pt-0">
      <Header />
      <div className="mx-auto mt-6 flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <Home />
      </div>
    </main>
  )
}

export default App
