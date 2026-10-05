import { useState } from "react";
import "../styles/components.css";
import { buildConceptSvg } from "../utils/svg";

function AIStudio({ onGenerate, onUpload, preview, setPreview }) {
  const [prompt, setPrompt] = useState("Futuristic product launch poster with rich light and luxury style");
  const [previewImage, setPreviewImage] = useState(preview || buildConceptSvg("Futuristic product launch poster", "#7b61ff"));

  const handleGenerateConcept = () => {
    const nextPrompt = prompt.trim() || "Cinematic brand campaign concept";
    const color = ["#7b61ff", "#3dd7b7", "#ff9b6a", "#5bc0ff"][Math.floor(Math.random() * 4)];
    const svg = buildConceptSvg(nextPrompt, color);
    setPreviewImage(svg);
    onGenerate();
  };

  return (
    <section className="studio-panel" id="ai-tools">
      <div className="section-header">
        <div>
          <span className="eyebrow">AI tools</span>
          <h2>Generate concepts</h2>
        </div>
        <button className="text-btn" type="button">
          Open studio
        </button>
      </div>

      <div className="studio-layout">
        <div className="ai-panel glass-card">
          <label htmlFor="aiPrompt">Creative prompt</label>
          <textarea
            id="aiPrompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows="6"
            placeholder="Describe your visual idea..."
          />
          <div className="ai-actions">
            <button className="primary-btn" type="button" onClick={handleGenerateConcept}>
              Generate concept
            </button>
            <button className="ghost-btn" type="button">
              Import asset
            </button>
          </div>
          <div className="chip-row">
            <span>Cinematic</span>
            <span>Product</span>
            <span>Brand</span>
            <span>Social</span>
          </div>
        </div>

        <div className="preview-panel glass-card">
          <div className="preview-header">
            <span>Concept preview</span>
            <button className="mini-btn" type="button" onClick={handleGenerateConcept}>
              Refresh
            </button>
          </div>
          <div className="preview-box">
            <img src={previewImage} alt="Generated concept preview" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIStudio;
