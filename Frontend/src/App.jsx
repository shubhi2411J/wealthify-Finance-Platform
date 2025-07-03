import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
    
        <Outlet />
      </main>
      <Toaster richColors/>
      <Footer />
    </>
  );
}

export default App;
