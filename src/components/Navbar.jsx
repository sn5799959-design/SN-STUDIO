import { useState, useRef } from "react";
import "../styles/navbar.css";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Video Editor", href: "#video-editor" },
  { label: "Photo Editor", href: "#photo-editor" },
  { label: "Documents", href: "#documents" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

function Navbar({ onUpload, onGenerate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = "";
    }
  };

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">SN</div>
        <div>
          <div className="brand-name">SN STUDIO</div>
          <div className="brand-sub">Creative editing platform</div>
        </div>
      </div>

      <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
        {navigation.map((item) => (
          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <button className="ghost-btn" type="button" onClick={() => fileInputRef.current?.click()}>
          Upload Project
        </button>
        <button className="primary-btn" type="button" onClick={onGenerate}>
          Create Project
        </button>
        <button className="menu-btn" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen((v) => !v)}>
          ☰
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.mp4,.mov,.zip" hidden onChange={handleFileUpload} />
    </header>
  );
}

export default Navbar;
