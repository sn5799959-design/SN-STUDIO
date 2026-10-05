import React, { useState } from "react";

const nav = [
  ["Dashboard", "⌂"],
  ["AI Tools", "✦"],
  ["Photo Editor", "◈"],
  ["Video Editor", "▶"],
  ["Templates", "▤"],
  ["My Projects", "□"],
];

const tools = [
  ["AI Image", "Generate visuals from a prompt", "✦"],
  ["Photo Editor", "Crop, adjust and transform", "◈"],
  ["Background", "Remove image backgrounds", "▣"],
  ["Enhancer", "Improve image quality", "◉"],
  ["Thumbnail", "Create social thumbnails", "▤"],
  ["Video Editor", "Build your next video", "▶"],
];

const demoImages = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
];

function App() {
  const [active, setActive] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const [aiStudio, setAiStudio] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("16:9");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generating, setGenerating] = useState(false);

  const action = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  const openAIImage = () => {
    setAiStudio(true);
    setActive("AI Image");
    setGeneratedImage("");
  };

  const closeAIImage = () => {
    setAiStudio(false);
    setActive("Dashboard");
  };

  const generateImage = () => {
    if (!prompt.trim()) {
      action("Please enter a prompt first.");
      return;
    }

    setGenerating(true);
    setGeneratedImage("");

    setTimeout(() => {
      const randomImage =
        demoImages[Math.floor(Math.random() * demoImages.length)];

      setGeneratedImage(randomImage);
      setGenerating(false);
      action("Preview generated successfully.");
    }, 1800);
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "sn-studio-ai-image.jpg";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      action("Image download started.");
    } catch {
      action("Download failed. Please try again.");
    }
  };

  if (aiStudio) {
    return (
      <div className="app-shell">

        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">SN</div>

            <div>
              <div className="brand-name">SN STUDIO</div>
              <div className="brand-sub">Creative workspace</div>
            </div>
          </div>

          <div className="workspace-label">WORKSPACE</div>

          <nav className="nav-list">
            {nav.map(([label, icon]) => (
              <button
                key={label}
                className={`nav-item ${
                  active === label ? "selected" : ""
                }`}
                onClick={() => {
                  if (label === "Dashboard") {
                    closeAIImage();
                  } else if (label === "AI Tools") {
                    setActive("AI Tools");
                  } else {
                    action(`${label} workspace coming soon.`);
                  }
                }}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-spacer" />

          <button
            className="nav-item"
            onClick={() => action("Settings coming soon.")}
          >
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </button>

          <div className="profile-card">
            <div className="avatar">S</div>

            <div className="profile-copy">
              <strong>Sangram</strong>
              <span>Free workspace</span>
            </div>

            <span className="dots">•••</span>
          </div>
        </aside>

        <main className="main-content">

          <header className="topbar">
            <div>
              <div className="eyebrow">AI CREATIVE TOOL</div>
              <h1>AI Image Studio</h1>
            </div>

            <div className="top-actions">
              <button
                className="search-btn"
                onClick={() => action("Search coming soon.")}
              >
                ⌕ Search
                <kbd>Ctrl K</kbd>
              </button>

              <button
                className="upgrade-btn"
                onClick={() => action("Upgrade system coming soon.")}
              >
                Upgrade
              </button>
            </div>
          </header>

          <section className="ai-workspace">

            <div className="ai-header">

              <div>
                <button
                  className="text-btn"
                  onClick={closeAIImage}
                >
                  ← Back to Dashboard
                </button>

                <h2>Create with AI</h2>

                <p>
                  Turn your imagination into visuals with SN STUDIO.
                </p>
              </div>

              <div className="ai-badge">
                ✦ AI IMAGE
              </div>

            </div>

            <div className="ai-grid">

              <div className="ai-controls">

                <div className="control-card">

                  <label>Prompt</label>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                  />

                  <div className="prompt-hint">
                    Example: A futuristic city at sunset, cinematic lighting,
                    ultra detailed
                  </div>

                </div>

                <div className="control-row">

                  <div className="control-card compact">
                    <label>Style</label>

                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                    >
                      <option>Cinematic</option>
                      <option>Photorealistic</option>
                      <option>Digital Art</option>
                      <option>Anime</option>
                      <option>3D Render</option>
                      <option>Minimal</option>
                    </select>
                  </div>

                  <div className="control-card compact">
                    <label>Aspect Ratio</label>

                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                    >
                      <option>16:9</option>
                      <option>1:1</option>
                      <option>4:5</option>
                      <option>9:16</option>
                    </select>
                  </div>

                </div>

                <button
                  className="primary-btn ai-generate-btn"
                  onClick={generateImage}
                  disabled={generating}
                >
                  {generating
                    ? "✦ Creating..."
                    : "✦ Generate Image"}
                </button>

                <div className="free-note">
                  <span>✓</span>
                  Free workspace preview
                </div>

              </div>

              <div className="ai-preview">

                {!generatedImage && !generating && (
                  <div className="preview-empty">

                    <div className="preview-icon">✦</div>

                    <h3>Your creation will appear here</h3>

                    <p>
                      Enter a prompt and click Generate Image.
                    </p>

                  </div>
                )}

                {generating && (
                  <div className="preview-empty">

                    <div className="loader">
                      ✦
                    </div>

                    <h3>Creating your visual...</h3>

                    <p>
                      SN STUDIO is preparing your preview.
                    </p>

                  </div>
                )}

                {generatedImage && !generating && (
                  <div className="generated-result">

                    <img
                      src={generatedImage}
                      alt="Generated preview"
                    />

                    <div className="result-overlay">

                      <div>
                        <span>{style}</span>
                        <span>{ratio}</span>
                      </div>

                      <div className="result-actions">

                        <button
                          onClick={generateImage}
                        >
                          ↻ Regenerate
                        </button>

                        <button
                          onClick={downloadImage}
                        >
                          ↓ Download
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

            <div className="ai-info-grid">

              <div className="info-card">
                <span>✦</span>
                <div>
                  <strong>Describe anything</strong>
                  <p>
                    Write your idea naturally and build your visual concept.
                  </p>
                </div>
              </div>

              <div className="info-card">
                <span>◈</span>
                <div>
                  <strong>Choose your style</strong>
                  <p>
                    Experiment with cinematic, realistic, artistic and more.
                  </p>
                </div>
              </div>

              <div className="info-card">
                <span>↓</span>
                <div>
                  <strong>Download your work</strong>
                  <p>
                    Save your generated preview directly to your device.
                  </p>
                </div>
              </div>

            </div>

          </section>

          <footer>
            SN STUDIO <span>•</span> AI Creative Workspace
          </footer>

        </main>

        {notice && (
          <div className="toast">
            {notice}
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">SN</div>

          <div>
            <div className="brand-name">SN STUDIO</div>
            <div className="brand-sub">
              Creative workspace
            </div>
          </div>

        </div>

        <div className="workspace-label">
          WORKSPACE
        </div>

        <nav className="nav-list">

          {nav.map(([label, icon]) => (

            <button
              key={label}
              className={`nav-item ${
                active === label ? "selected" : ""
              }`}
              onClick={() => {
                if (label === "AI Tools") {
                  setActive("AI Tools");
                  openAIImage();
                } else if (label === "Dashboard") {
                  setActive("Dashboard");
                } else {
                  setActive(label);
                  action(`${label} workspace coming soon.`);
                }
              }}
            >

              <span className="nav-icon">
                {icon}
              </span>

              <span>{label}</span>

            </button>

          ))}

        </nav>

        <div className="sidebar-spacer" />

        <button
          className="nav-item"
          onClick={() => action("Settings coming soon.")}
        >

          <span className="nav-icon">
            ⚙
          </span>

          <span>Settings</span>

        </button>

        <div className="profile-card">

          <div className="avatar">
            S
          </div>

          <div className="profile-copy">

            <strong>
              Sangram
            </strong>

            <span>
              Free workspace
            </span>

          </div>

          <span className="dots">
            •••
          </span>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="eyebrow">
              CREATIVE WORKSPACE
            </div>

            <h1>
              {active}
            </h1>

          </div>

          <div className="top-actions">

            <button
              className="search-btn"
              onClick={() => action("Search coming soon.")}
            >
              ⌕ Search
              <kbd>Ctrl K</kbd>
            </button>

            <button
              className="upgrade-btn"
              onClick={() => action("Upgrade system coming soon.")}
            >
              Upgrade
            </button>

          </div>

        </header>

        <section className="hero">

          <div className="hero-copy">

            <div className="pill">
              ✦ AI POWERED CREATIVE STUDIO
            </div>

            <h2>
              Create something{" "}
              <em>extraordinary.</em>
            </h2>

            <p>
              Generate, edit and transform your ideas in one
              powerful creative workspace.
            </p>

            <div className="hero-actions">

              <button
                className="primary-btn"
                onClick={openAIImage}
              >
                ✦ Create with AI
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  action("Project upload coming soon.")
                }
              >
                Upload Project
              </button>

            </div>

            <div className="mini-stats">

              <span>
                <b>6</b> creative tools
              </span>

              <span>
                <b>∞</b> ideas
              </span>

              <span>
                <b>24/7</b> workspace
              </span>

            </div>

          </div>

          <div className="hero-visual">

            <div className="visual-glow" />

            <div className="orbit orbit-a" />

            <div className="orbit orbit-b" />

            <div className="visual-card">

              <div className="visual-top">
                <span>SN</span>
                <span>STUDIO</span>
              </div>

              <div className="visual-center">
                ✦
              </div>

              <div className="visual-bottom">
                CREATE · EDIT · INSPIRE
              </div>

            </div>

          </div>

        </section>

        <section className="section">

          <div className="section-head">

            <div>

              <div className="eyebrow">
                TOOLS
              </div>

              <h2>
                Start creating
              </h2>

            </div>

            <button
              className="text-btn"
              onClick={() =>
                action("All tools coming soon.")
              }
            >
              View all →
            </button>

          </div>

          <div className="tool-grid">

            {tools.map(([title, desc, icon]) => (

              <button
                className="tool-card"
                key={title}
                onClick={() => {
                  if (title === "AI Image") {
                    openAIImage();
                  } else {
                    action(`${title} selected.`);
                  }
                }}
              >

                <div className="tool-icon">
                  {icon}
                </div>

                <div className="tool-copy">

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {desc}
                  </p>

                </div>

                <span className="card-arrow">
                  ↗
                </span>

              </button>

            ))}

          </div>

        </section>

        <section className="section projects">

          <div className="section-head">

            <div>

              <div className="eyebrow">
                WORKSPACE
              </div>

              <h2>
                Recent projects
              </h2>

            </div>

            <button
              className="text-btn"
              onClick={() =>
                action("Project library coming soon.")
              }
            >
              See all →
            </button>

          </div>

          <div className="empty-project">

            <div className="empty-mark">
              ＋
            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Your creative projects will appear here.
            </p>

            <button
              className="primary-btn small"
              onClick={() =>
                action("New project coming soon.")
              }
            >
              Create your first project
            </button>

          </div>

        </section>

        <footer>
          SN STUDIO <span>•</span> AI Creative Workspace
        </footer>

      </main>

      {notice && (
        <div className="toast">
          {notice}
        </div>
      )}

    </div>
  );
}

export default App;
