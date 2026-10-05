import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import ToolSection from "./components/ToolSection";
import AIStudio from "./components/AIStudio";
import Templates from "./components/Templates";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import "./styles/global.css";

function App() {
  const [toast, setToast] = useState("");
  const [preview, setPreview] = useState(null);
  const [projectName, setProjectName] = useState("Launch Visual");

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(""), 2200);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const fileName = file.name || "uploaded-project";
    setProjectName(fileName.replace(/\.[^/.]+$/, ""));
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    showToast("Project uploaded.");
  };

  return (
    <div className="site-shell">
      <Navbar onUpload={handleFileUpload} onGenerate={() => showToast("Concept generated.")} />
      <main className="page-content">
        <Hero preview={preview} projectName={projectName} onGenerate={() => showToast("Concept generated.")} onUpload={handleFileUpload} />
        <Dashboard />
        <ToolSection />
        <AIStudio onGenerate={() => showToast("Concept generated.")} onUpload={handleFileUpload} preview={preview} setPreview={setPreview} />
        <Templates />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
