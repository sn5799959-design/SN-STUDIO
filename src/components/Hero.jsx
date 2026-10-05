import { useState, useRef, useMemo } from "react";
import "../styles/hero.css";
import { buildConceptSvg } from "../utils/svg";

const metrics = [
  { value: "4.8x", label: "Faster delivery" },
  { value: "2.1M", label: "Frames refined" },
  { value: "38k", label: "Design exports" },
  { value: "24/7", label: "Creative support" },
];

function Hero({ preview, projectName, onGenerate, onUpload }) {
  const [previewImage, setPreviewImage] = useState(preview || buildConceptSvg("Futuristic product launch poster", "#7b61ff"));
  const fileInputRef = useRef(null);

  const lastGenerated = useMemo(() => projectName || "Launch Visual", [projectName]);

  const handleGenerateConcept = () => {
    const color = ["#7b61ff", "#3dd7b7", "#ff9b6a", "#5bc0ff"][Math.floor(Math.random() * 4)];
    const svg = buildConceptSvg("Futuristic creative concept", color);
    setPreviewImage(svg);
    onGenerate();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      onUpload(file);
      event.target.value = "";
    }
  };

  return (
    <section className="hero-panel" id="home">
      <div className="hero-copy">
        <span className="eyebrow">Premium creative suite</span>
        <h1>
          Create. <span>Edit.</span> Inspire.
        </h1>
        <p>A premium editing ecosystem for video, photo, documents, thumbnails, and AI-powered creative workflows.</p>
        <div className="hero-actions">
          <button className="primary-btn large" type="button" onClick={handleGenerateConcept}>
            Launch AI Concept
          </button>
          <button className="ghost-btn large" type="button" onClick={() => fileInputRef.current?.click()}>
            Upload Media
          </button>
        </div>
        <div className="hero-stats">
          {metrics.map((stat) => (
            <div key={stat.label} className="stat-box">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="glass-window">
          <div className="window-head">
            <span className="dot red" />
            <span className="dot amber" />
            <span className="dot green" />
          </div>
          <div className="canvas-wrap">
            <img src={previewImage} alt="SN STUDIO creative preview" />
          </div>
          <div className="window-meta">
            <span>{lastGenerated}</span>
            <span>AI Render</span>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.mp4,.mov,.zip" hidden onChange={handleFileUpload} />
    </section>
  );
}

export default Hero;
