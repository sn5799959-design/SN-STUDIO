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

function App() {
  const [active, setActive] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const [aiStudio, setAiStudio] = useState(false);
  const [backgroundStudio, setBackgroundStudio] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [backgroundResult, setBackgroundResult] = useState("");
  const [removingBackground, setRemovingBackground] = useState(false);

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

  const openBackground = () => {
    setAiStudio(false);
    setBackgroundStudio(true);
    setActive("Background");
  };

  const closeBackground = () => {
    setBackgroundStudio(false);
    setActive("Dashboard");
  };

  const handleBackgroundFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      action("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      action("Image must be smaller than 10 MB.");
      return;
    }

    if (backgroundPreview) {
      URL.revokeObjectURL(backgroundPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setBackgroundFile(file);
    setBackgroundPreview(previewUrl);
    setBackgroundResult("");
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const composeTransparentPng = async (originalUrl, maskValue) => {
    const maskSrc = maskValue.startsWith("data:")
      ? maskValue
      : `data:image/png;base64,${maskValue}`;

    const [original, mask] = await Promise.all([
      loadImage(originalUrl),
      loadImage(maskSrc),
    ]);

    const width = original.naturalWidth || original.width;
    const height = original.naturalHeight || original.height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(original, 0, 0, width, height);

    const originalPixels = context.getImageData(0, 0, width, height);

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;

    const maskContext = maskCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    maskContext.drawImage(mask, 0, 0, width, height);

    const maskPixels = maskContext.getImageData(
      0,
      0,
      width,
      height
    ).data;

    for (let i = 0; i < originalPixels.data.length; i += 4) {
      originalPixels.data[i + 3] = maskPixels[i];
    }

    context.putImageData(originalPixels, 0, 0);

    return canvas.toDataURL("image/png");
  };

  const removeBackground = async () => {
    if (!backgroundFile) {
      action("Upload an image first.");
      return;
    }

    setRemovingBackground(true);
    setBackgroundResult("");

    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(backgroundFile);
      });

      const response = await fetch(
        "/.netlify/functions/remove-background",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Background removal failed."
        );
      }

      const segments = Array.isArray(data.result)
        ? data.result
        : [];

      if (!segments.length) {
        throw new Error(
          "No background mask was returned by the AI service."
        );
      }

      const bestSegment = [...segments].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      )[0];

      const mask = bestSegment.mask;

      if (!mask) {
        throw new Error("The AI service returned an invalid mask.");
      }

      const transparentPng = await composeTransparentPng(
        backgroundPreview,
        mask
      );

      setBackgroundResult(transparentPng);
      action("Background removed successfully! ✦");
    } catch (error) {
      console.error("Background removal error:", error);
      action(
        error.message ||
          "Background removal failed. Please try again."
      );
    } finally {
      setRemovingBackground(false);
    }
  };

  const downloadBackground = () => {
    if (!backgroundResult) return;

    const link = document.createElement("a");
    link.href = backgroundResult;
    link.download = "sn-studio-background-removed.png";
    document.body.appendChild(link);
    link.click();
    link.remove();

    action("Transparent PNG download started.");
  };

  // REAL AI IMAGE GENERATION
  const generateImage = async () => {
    if (!prompt.trim()) {
      action("Please enter a prompt first.");
      return;
    }

    setGenerating(true);
    setGeneratedImage("");

    try {
      const response = await fetch(
        "/.netlify/functions/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            style,
            aspectRatio: ratio,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Image generation failed."
        );
      }

      setGeneratedImage(data.image);
      action("AI image generated successfully! ✦");
    } catch (error) {
      console.error("Image generation error:", error);

      action(
        error.message ||
          "Image generation failed. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "sn-studio-ai-image.png";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      action("Image download started.");
    } catch {
      action("Download failed. Please try again.");
    }
  };

  // =========================================================
  // BACKGROUND REMOVER STUDIO
  // =========================================================

  if (backgroundStudio) {
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
                className={`nav-item ${active === label ? "selected" : ""}`}
                onClick={() => {
                  if (label === "Dashboard") {
                    closeBackground();
                  } else if (label === "AI Tools") {
                    openAIImage();
                  } else if (label === "Background") {
                    setActive("Background");
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
              <h1>Background Remover</h1>
            </div>

            <div className="top-actions">
              <button
                className="search-btn"
                onClick={() => action("Search coming soon.")}
              >
                ⌕ Search <kbd>Ctrl K</kbd>
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
                <button className="text-btn" onClick={closeBackground}>
                  ← Back to Dashboard
                </button>
                <h2>Remove Background</h2>
                <p>
                  Upload a photo and let SN STUDIO create a clean transparent PNG.
                </p>
              </div>

              <div className="ai-badge">▣ BACKGROUND</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1.1fr)",
                gap: "22px",
                alignItems: "stretch",
              }}
            >
              <div
                className="control-card"
                style={{
                  minHeight: 420,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <label>Upload Image</label>

                <label
                  htmlFor="background-upload"
                  style={{
                    marginTop: 14,
                    flex: 1,
                    minHeight: 300,
                    border: "1px dashed rgba(255,255,255,0.18)",
                    borderRadius: 18,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.025)",
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {backgroundPreview ? (
                    <img
                      src={backgroundPreview}
                      alt="Uploaded preview"
                      style={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "contain",
                        borderRadius: 14,
                      }}
                    />
                  ) : (
                    <>
                      <div style={{ fontSize: 42 }}>▣</div>
                      <strong>Click to upload</strong>
                      <span style={{ opacity: 0.6, fontSize: 13 }}>
                        PNG, JPG or WEBP · Max 10 MB
                      </span>
                    </>
                  )}
                </label>

                <input
                  id="background-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBackgroundFile}
                  style={{ display: "none" }}
                />

                <button
                  className="primary-btn ai-generate-btn"
                  onClick={removeBackground}
                  disabled={removingBackground || !backgroundFile}
                  style={{ marginTop: 18 }}
                >
                  {removingBackground
                    ? "✦ Removing background..."
                    : "✦ Remove Background"}
                </button>

                <div className="free-note">
                  <span>✓</span>
                  AI-powered background removal
                </div>
              </div>

              <div
                className="ai-preview"
                style={{
                  minHeight: 420,
                  position: "relative",
                  overflow: "hidden",
                  backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.035) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.035) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,.035) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.035) 75%)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
                }}
              >
                {!backgroundResult && !removingBackground && (
                  <div className="preview-empty">
                    <div className="preview-icon">▣</div>
                    <h3>Your transparent result will appear here</h3>
                    <p>Upload an image and click Remove Background.</p>
                  </div>
                )}

                {removingBackground && (
                  <div className="preview-empty">
                    <div className="loader">✦</div>
                    <h3>Removing background...</h3>
                    <p>SN STUDIO is processing your image.</p>
                  </div>
                )}

                {backgroundResult && !removingBackground && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 420,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 18,
                      padding: 20,
                    }}
                  >
                    <img
                      src={backgroundResult}
                      alt="Background removed result"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 340,
                        objectFit: "contain",
                        borderRadius: 14,
                      }}
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                      <button className="primary-btn small" onClick={downloadBackground}>
                        ↓ Download PNG
                      </button>
                      <button
                        className="text-btn"
                        onClick={() => {
                          setBackgroundResult("");
                          action("Ready for another image.");
                        }}
                      >
                        ↻ Try Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="ai-info-grid">
              <div className="info-card">
                <span>▣</span>
                <div>
                  <strong>Clean cutout</strong>
                  <p>AI detects the main subject and creates a transparency mask.</p>
                </div>
              </div>

              <div className="info-card">
                <span>◈</span>
                <div>
                  <strong>Transparent PNG</strong>
                  <p>Your result keeps the subject without the original background.</p>
                </div>
              </div>

              <div className="info-card">
                <span>↓</span>
                <div>
                  <strong>Download ready</strong>
                  <p>Save the finished transparent image directly to your device.</p>
                </div>
              </div>
            </div>
          </section>

          <footer>
            SN STUDIO <span>•</span> AI Creative Workspace
          </footer>
        </main>

        {notice && <div className="toast">{notice}</div>}
      </div>
    );
  }

  // =========================================================
  // AI IMAGE STUDIO
  // =========================================================

  if (aiStudio) {
    return (
      <div className="app-shell">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <div className="brand">
            <div className="brand-mark">SN</div>

            <div>
              <div className="brand-name">
                SN STUDIO
              </div>

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

                  if (label === "Dashboard") {
                    closeAIImage();

                  } else if (label === "AI Tools") {
                    setActive("AI Tools");

                  } else {
                    action(
                      `${label} workspace coming soon.`
                    );
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
            onClick={() =>
              action("Settings coming soon.")
            }
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

        {/* MAIN CONTENT */}
        <main className="main-content">

          <header className="topbar">

            <div>

              <div className="eyebrow">
                AI CREATIVE TOOL
              </div>

              <h1>
                AI Image Studio
              </h1>

            </div>

            <div className="top-actions">

              <button
                className="search-btn"
                onClick={() =>
                  action("Search coming soon.")
                }
              >
                ⌕ Search
                <kbd>Ctrl K</kbd>
              </button>

              <button
                className="upgrade-btn"
                onClick={() =>
                  action("Upgrade system coming soon.")
                }
              >
                Upgrade
              </button>

            </div>

          </header>

          {/* AI WORKSPACE */}
          <section className="ai-workspace">

            <div className="ai-header">

              <div>

                <button
                  className="text-btn"
                  onClick={closeAIImage}
                >
                  ← Back to Dashboard
                </button>

                <h2>
                  Create with AI
                </h2>

                <p>
                  Turn your imagination into visuals
                  with SN STUDIO.
                </p>

              </div>

              <div className="ai-badge">
                ✦ AI IMAGE
              </div>

            </div>

            <div className="ai-grid">

              {/* CONTROLS */}
              <div className="ai-controls">

                <div className="control-card">

                  <label>
                    Prompt
                  </label>

                  <textarea
                    value={prompt}
                    onChange={(e) =>
                      setPrompt(e.target.value)
                    }
                    placeholder="Describe the image you want to create..."
                  />

                  <div className="prompt-hint">
                    Example: A futuristic city at sunset,
                    cinematic lighting, ultra detailed
                  </div>

                </div>

                <div className="control-row">

                  <div className="control-card compact">

                    <label>
                      Style
                    </label>

                    <select
                      value={style}
                      onChange={(e) =>
                        setStyle(e.target.value)
                      }
                    >
                      <option>
                        Cinematic
                      </option>

                      <option>
                        Photorealistic
                      </option>

                      <option>
                        Digital Art
                      </option>

                      <option>
                        Anime
                      </option>

                      <option>
                        3D Render
                      </option>

                      <option>
                        Minimal
                      </option>
                    </select>

                  </div>

                  <div className="control-card compact">

                    <label>
                      Aspect Ratio
                    </label>

                    <select
                      value={ratio}
                      onChange={(e) =>
                        setRatio(e.target.value)
                      }
                    >
                      <option>
                        16:9
                      </option>

                      <option>
                        1:1
                      </option>

                      <option>
                        4:5
                      </option>

                      <option>
                        9:16
                      </option>

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

              {/* PREVIEW */}
              <div className="ai-preview">

                {!generatedImage &&
                  !generating && (
                    <div className="preview-empty">

                      <div className="preview-icon">
                        ✦
                      </div>

                      <h3>
                        Your creation will appear here
                      </h3>

                      <p>
                        Enter a prompt and click
                        Generate Image.
                      </p>

                    </div>
                  )}

                {generating && (
                  <div className="preview-empty">

                    <div className="loader">
                      ✦
                    </div>

                    <h3>
                      Creating your visual...
                    </h3>

                    <p>
                      SN STUDIO is preparing your
                      AI-generated image.
                    </p>

                  </div>
                )}

                {generatedImage &&
                  !generating && (
                    <div className="generated-result">

                      <img
                        src={generatedImage}
                        alt="AI generated preview"
                      />

                      <div className="result-overlay">

                        <div>
                          <span>
                            {style}
                          </span>

                          <span>
                            {ratio}
                          </span>
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

            {/* INFO CARDS */}
            <div className="ai-info-grid">

              <div className="info-card">

                <span>
                  ✦
                </span>

                <div>

                  <strong>
                    Describe anything
                  </strong>

                  <p>
                    Write your idea naturally and
                    build your visual concept.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ◈
                </span>

                <div>

                  <strong>
                    Choose your style
                  </strong>

                  <p>
                    Experiment with cinematic,
                    realistic, artistic and more.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ↓
                </span>

                <div>

                  <strong>
                    Download your work
                  </strong>

                  <p>
                    Save your generated preview
                    directly to your device.
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

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            SN
          </div>

          <div>

            <div className="brand-name">
              SN STUDIO
            </div>

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
                active === label
                  ? "selected"
                  : ""
              }`}
              onClick={() => {

                if (label === "AI Tools") {

                  setActive("AI Tools");
                  openAIImage();

                } else if (label === "Dashboard") {

                  setActive("Dashboard");

                } else {

                  setActive(label);

                  action(
                    `${label} workspace coming soon.`
                  );

                }

              }}
            >

              <span className="nav-icon">
                {icon}
              </span>

              <span>
                {label}
              </span>

            </button>

          ))}

        </nav>

        <div className="sidebar-spacer" />

        <button
          className="nav-item"
          onClick={() =>
            action("Settings coming soon.")
          }
        >

          <span className="nav-icon">
            ⚙
          </span>

          <span>
            Settings
          </span>

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

      {/* MAIN */}
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
              onClick={() =>
                action("Search coming soon.")
              }
            >
              ⌕ Search
              <kbd>Ctrl K</kbd>
            </button>

            <button
              className="upgrade-btn"
              onClick={() =>
                action("Upgrade system coming soon.")
              }
            >
              Upgrade
            </button>

          </div>

        </header>

        {/* HERO */}
        <section className="hero">

          <div className="hero-copy">

            <div className="pill">
              ✦ AI POWERED CREATIVE STUDIO
            </div>

            <h2>
              Create something{" "}
              <em>
                extraordinary.
              </em>
            </h2>

            <p>
              Generate, edit and transform your
              ideas in one powerful creative
              workspace.
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
                  action(
                    "Project upload coming soon."
                  )
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
                <span>
                  SN
                </span>

                <span>
                  STUDIO
                </span>
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

        {/* TOOLS */}
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
                action(
                  "All tools coming soon."
                )
              }
            >
              View all →
            </button>

          </div>

          <div className="tool-grid">

            {tools.map(
              ([title, desc, icon]) => (

                <button
                  className="tool-card"
                  key={title}
                  onClick={() => {

                    if (title === "AI Image") {

                      openAIImage();

                    } else if (title === "Background") {

                      openBackground();

                    } else {

                      action(
                        `${title} selected.`
                      );

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

              )
            )}

          </div>

        </section>

        {/* PROJECTS */}
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
                action(
                  "Project library coming soon."
                )
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
              Your creative projects will
              appear here.
            </p>

            <button
              className="primary-btn small"
              onClick={() =>
                action(
                  "New project coming soon."
                )
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
