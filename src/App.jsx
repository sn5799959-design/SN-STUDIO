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

  // AI IMAGE
  const [aiStudio, setAiStudio] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("16:9");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generating, setGenerating] = useState(false);

  // BACKGROUND REMOVER
  const [backgroundStudio, setBackgroundStudio] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [backgroundResult, setBackgroundResult] = useState("");
  const [removingBackground, setRemovingBackground] = useState(false);

  const action = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

  // =========================
  // AI IMAGE
  // =========================

  const openAIImage = () => {
    setBackgroundStudio(false);
    setAiStudio(true);
    setActive("AI Tools");
  };

  const closeAIImage = () => {
    setAiStudio(false);
    setActive("Dashboard");
  };

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
      console.error(error);

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

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "sn-studio-ai-image.png";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      action("Image download started.");
    } catch {
      action("Download failed.");
    }
  };

  // =========================
  // BACKGROUND REMOVER
  // =========================

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
      action("Please select an image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      action("Maximum file size is 10 MB.");
      return;
    }

    if (backgroundPreview) {
      URL.revokeObjectURL(backgroundPreview);
    }

    const preview = URL.createObjectURL(file);

    setBackgroundFile(file);
    setBackgroundPreview(preview);
    setBackgroundResult("");
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      img.src = src;
    });

  // Convert original + AI mask into transparent PNG
  const createTransparentPNG = async (
    originalURL,
    maskBase64
  ) => {
    const maskURL = maskBase64.startsWith("data:")
      ? maskBase64
      : `data:image/png;base64,${maskBase64}`;

    const [original, mask] = await Promise.all([
      loadImage(originalURL),
      loadImage(maskURL),
    ]);

    const width =
      original.naturalWidth || original.width;

    const height =
      original.naturalHeight || original.height;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    ctx.drawImage(
      original,
      0,
      0,
      width,
      height
    );

    const originalPixels =
      ctx.getImageData(
        0,
        0,
        width,
        height
      );

    const maskCanvas =
      document.createElement("canvas");

    maskCanvas.width = width;
    maskCanvas.height = height;

    const maskCtx =
      maskCanvas.getContext("2d", {
        willReadFrequently: true,
      });

    maskCtx.drawImage(
      mask,
      0,
      0,
      width,
      height
    );

    const maskPixels =
      maskCtx.getImageData(
        0,
        0,
        width,
        height
      ).data;

    for (
      let i = 0;
      i < originalPixels.data.length;
      i += 4
    ) {
      originalPixels.data[i + 3] =
        maskPixels[i];
    }

    ctx.putImageData(
      originalPixels,
      0,
      0
    );

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
      const formData = new FormData();

      formData.append(
        "image",
        backgroundFile
      );

      const response = await fetch(
        "/.netlify/functions/remove-background",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Background removal failed."
        );
      }

      // If backend directly returns an image
      if (data.image) {
        setBackgroundResult(data.image);

        action(
          "Background removed successfully! ✦"
        );

        return;
      }

      // Otherwise use AI mask
      const segments =
        Array.isArray(data.result)
          ? data.result
          : Array.isArray(data.mask)
          ? data.mask
          : [];

      if (!segments.length) {
        throw new Error(
          "No background mask was returned."
        );
      }

      const bestSegment = [...segments].sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      )[0];

      const mask =
        bestSegment.mask ||
        bestSegment;

      if (
        !mask ||
        typeof mask !== "string"
      ) {
        throw new Error(
          "Invalid AI mask received."
        );
      }

      const transparentPNG =
        await createTransparentPNG(
          backgroundPreview,
          mask
        );

      setBackgroundResult(
        transparentPNG
      );

      action(
        "Background removed successfully! ✦"
      );
    } catch (error) {
      console.error(
        "Background error:",
        error
      );

      action(
        error.message ||
          "Background removal failed."
      );
    } finally {
      setRemovingBackground(false);
    }
  };

  const downloadBackground = () => {
    if (!backgroundResult) return;

    const link =
      document.createElement("a");

    link.href = backgroundResult;

    link.download =
      "sn-studio-background-removed.png";

    document.body.appendChild(link);

    link.click();

    link.remove();

    action(
      "Transparent PNG download started."
    );
  };

  // =========================
  // SIDEBAR
  // =========================

  const Sidebar = () => (
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

        {nav.map(
          ([label, icon]) => (
            <button
              key={label}
              className={`nav-item ${
                active === label
                  ? "selected"
                  : ""
              }`}
              onClick={() => {

                if (
                  label ===
                  "Dashboard"
                ) {
                  setAiStudio(false);
                  setBackgroundStudio(false);
                  setActive(
                    "Dashboard"
                  );

                } else if (
                  label ===
                  "AI Tools"
                ) {
                  openAIImage();

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

              <span>
                {label}
              </span>

            </button>
          )
        )}

      </nav>

      <div className="sidebar-spacer" />

      <button
        className="nav-item"
        onClick={() =>
          action(
            "Settings coming soon."
          )
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
  );

  // =========================
  // BACKGROUND STUDIO
  // =========================

  if (backgroundStudio) {
    return (
      <div className="app-shell">

        <Sidebar />

        <main className="main-content">

          <header className="topbar">

            <div>

              <div className="eyebrow">
                AI CREATIVE TOOL
              </div>

              <h1>
                Background Remover
              </h1>

            </div>

            <div className="top-actions">

              <button
                className="search-btn"
                onClick={() =>
                  action(
                    "Search coming soon."
                  )
                }
              >
                ⌕ Search
                <kbd>Ctrl K</kbd>
              </button>

              <button
                className="upgrade-btn"
                onClick={() =>
                  action(
                    "Upgrade coming soon."
                  )
                }
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
                  onClick={
                    closeBackground
                  }
                >
                  ← Back to Dashboard
                </button>

                <h2>
                  Remove Background
                </h2>

                <p>
                  Upload a photo and
                  create a clean
                  transparent PNG.
                </p>

              </div>

              <div className="ai-badge">
                ▣ BACKGROUND
              </div>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(280px, 0.9fr) minmax(320px, 1.1fr)",
                gap: "22px",
              }}
            >

              {/* UPLOAD */}
              <div
                className="control-card"
                style={{
                  minHeight: 420,
                  display: "flex",
                  flexDirection:
                    "column",
                }}
              >

                <label>
                  Upload Image
                </label>

                <label
                  htmlFor="bg-upload"
                  style={{
                    marginTop: 15,
                    flex: 1,
                    minHeight: 300,
                    border:
                      "1px dashed rgba(255,255,255,.2)",
                    borderRadius: 18,
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    gap: 12,
                    cursor: "pointer",
                    padding: 20,
                    textAlign: "center",
                  }}
                >

                  {backgroundPreview ? (

                    <img
                      src={
                        backgroundPreview
                      }
                      alt="Uploaded"
                      style={{
                        maxWidth:
                          "100%",
                        maxHeight:
                          280,
                        objectFit:
                          "contain",
                        borderRadius:
                          14,
                      }}
                    />

                  ) : (

                    <>
                      <div
                        style={{
                          fontSize: 45,
                        }}
                      >
                        ▣
                      </div>

                      <strong>
                        Click to upload
                      </strong>

                      <span
                        style={{
                          opacity: 0.6,
                          fontSize: 13,
                        }}
                      >
                        PNG, JPG or WEBP
                        <br />
                        Maximum 10 MB
                      </span>
                    </>

                  )}

                </label>

                <input
                  id="bg-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleBackgroundFile
                  }
                  style={{
                    display: "none",
                  }}
                />

                <button
                  className="primary-btn ai-generate-btn"
                  onClick={
                    removeBackground
                  }
                  disabled={
                    !backgroundFile ||
                    removingBackground
                  }
                  style={{
                    marginTop: 18,
                  }}
                >

                  {removingBackground
                    ? "✦ Removing..."
                    : "✦ Remove Background"}

                </button>

                <div className="free-note">

                  <span>
                    ✓
                  </span>

                  AI-powered
                  background removal

                </div>

              </div>

              {/* RESULT */}
              <div
                className="ai-preview"
                style={{
                  minHeight: 420,
                  position:
                    "relative",
                  overflow:
                    "hidden",
                }}
              >

                {!backgroundResult &&
                  !removingBackground && (

                    <div className="preview-empty">

                      <div className="preview-icon">
                        ▣
                      </div>

                      <h3>
                        Your result
                        will appear here
                      </h3>

                      <p>
                        Upload an image
                        and remove its
                        background.
                      </p>

                    </div>

                  )}

                {removingBackground && (

                  <div className="preview-empty">

                    <div className="loader">
                      ✦
                    </div>

                    <h3>
                      Removing
                      background...
                    </h3>

                    <p>
                      SN STUDIO is
                      processing your
                      image.
                    </p>

                  </div>

                )}

                {backgroundResult &&
                  !removingBackground && (

                    <div
                      style={{
                        minHeight: 420,
                        width: "100%",
                        display: "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: 20,
                        padding: 20,
                        backgroundImage:
                          "linear-gradient(45deg,#ffffff08 25%,transparent 25%),linear-gradient(-45deg,#ffffff08 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ffffff08 75%),linear-gradient(-45deg,transparent 75%,#ffffff08 75%)",
                        backgroundSize:
                          "24px 24px",
                        backgroundPosition:
                          "0 0,0 12px,12px -12px,-12px 0",
                      }}
                    >

                      <img
                        src={
                          backgroundResult
                        }
                        alt="Background removed"
                        style={{
                          maxWidth:
                            "100%",
                          maxHeight:
                            330,
                          objectFit:
                            "contain",
                          borderRadius:
                            14,
                        }}
                      />

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 10,
                          flexWrap:
                            "wrap",
                          justifyContent:
                            "center",
                        }}
                      >

                        <button
                          className="primary-btn small"
                          onClick={
                            downloadBackground
                          }
                        >
                          ↓ Download PNG
                        </button>

                        <button
                          className="text-btn"
                          onClick={() =>
                            setBackgroundResult(
                              ""
                            )
                          }
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

                <span>
                  ▣
                </span>

                <div>

                  <strong>
                    AI Cutout
                  </strong>

                  <p>
                    AI detects the
                    main subject.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ◈
                </span>

                <div>

                  <strong>
                    Transparent PNG
                  </strong>

                  <p>
                    Background becomes
                    transparent.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ↓
                </span>

                <div>

                  <strong>
                    Download
                  </strong>

                  <p>
                    Save the PNG
                    directly.
                  </p>

                </div>

              </div>

            </div>

          </section>

          <footer>
            SN STUDIO
            <span> • </span>
            AI Creative Workspace
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

  // =========================
  // AI IMAGE STUDIO
  // =========================

  if (aiStudio) {
    return (
      <div className="app-shell">

        <Sidebar />

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
                  action(
                    "Search coming soon."
                  )
                }
              >
                ⌕ Search
                <kbd>Ctrl K</kbd>
              </button>

              <button
                className="upgrade-btn"
                onClick={() =>
                  action(
                    "Upgrade coming soon."
                  )
                }
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
                  onClick={
                    closeAIImage
                  }
                >
                  ← Back to Dashboard
                </button>

                <h2>
                  Create with AI
                </h2>

                <p>
                  Turn your imagination
                  into visuals.
                </p>

              </div>

              <div className="ai-badge">
                ✦ AI IMAGE
              </div>

            </div>

            <div className="ai-grid">

              <div className="ai-controls">

                <div className="control-card">

                  <label>
                    Prompt
                  </label>

                  <textarea
                    value={prompt}
                    onChange={(e) =>
                      setPrompt(
                        e.target.value
                      )
                    }
                    placeholder="Describe the image you want to create..."
                  />

                  <div className="prompt-hint">
                    Example: futuristic
                    city at sunset,
                    cinematic lighting,
                    ultra detailed
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
                        setStyle(
                          e.target.value
                        )
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
                        setRatio(
                          e.target.value
                        )
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
                  onClick={
                    generateImage
                  }
                  disabled={
                    generating
                  }
                >
                  {generating
                    ? "✦ Creating..."
                    : "✦ Generate Image"}
                </button>

                <div className="free-note">

                  <span>
                    ✓
                  </span>

                  AI generation
                  enabled

                </div>

              </div>

              <div className="ai-preview">

                {!generatedImage &&
                  !generating && (

                    <div className="preview-empty">

                      <div className="preview-icon">
                        ✦
                      </div>

                      <h3>
                        Your creation
                        will appear here
                      </h3>

                      <p>
                        Enter a prompt
                        and generate.
                      </p>

                    </div>

                  )}

                {generating && (

                  <div className="preview-empty">

                    <div className="loader">
                      ✦
                    </div>

                    <h3>
                      Creating your
                      visual...
                    </h3>

                    <p>
                      SN STUDIO is
                      generating your
                      image.
                    </p>

                  </div>

                )}

                {generatedImage &&
                  !generating && (

                    <div className="generated-result">

                      <img
                        src={
                          generatedImage
                        }
                        alt="AI generated"
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
                            onClick={
                              generateImage
                            }
                          >
                            ↻ Regenerate
                          </button>

                          <button
                            onClick={
                              downloadImage
                            }
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

                <span>
                  ✦
                </span>

                <div>

                  <strong>
                    Describe anything
                  </strong>

                  <p>
                    Turn your ideas
                    into visuals.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ◈
                </span>

                <div>

                  <strong>
                    Multiple styles
                  </strong>

                  <p>
                    Cinematic,
                    realistic,
                    artistic and more.
                  </p>

                </div>

              </div>

              <div className="info-card">

                <span>
                  ↓
                </span>

                <div>

                  <strong>
                    Download
                  </strong>

                  <p>
                    Save your generated
                    image.
                  </p>

                </div>

              </div>

            </div>

          </section>

          <footer>
            SN STUDIO
            <span> • </span>
            AI Creative Workspace
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

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="app-shell">

      <Sidebar />

      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="eyebrow">
              AI CREATIVE WORKSPACE
            </div>

            <h1>
              Create something amazing.
            </h1>

          </div>

          <div className="top-actions">

            <button
              className="search-btn"
              onClick={() =>
                action(
                  "Search coming soon."
                )
              }
            >
              ⌕ Search
              <kbd>Ctrl K</kbd>
            </button>

            <button
              className="upgrade-btn"
              onClick={() =>
                action(
                  "Upgrade coming soon."
                )
              }
            >
              Upgrade
            </button>

          </div>

        </header>

        <section className="hero">

          <div className="hero-copy">

            <div className="eyebrow">
              SN STUDIO
            </div>

            <h2>
              Your AI creative
              workspace.
            </h2>

            <p>
              Create images, edit photos,
              remove backgrounds and
              build your next visual.
            </p>

            <button
              className="primary-btn"
              onClick={
                openAIImage
              }
            >
              ✦ Start Creating
            </button>

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

          </div>

          <div className="tool-grid">

            {tools.map(
              ([title, desc, icon]) => (

                <button
                  className="tool-card"
                  key={title}
                  onClick={() => {

                    if (
                      title ===
                      "AI Image"
                    ) {
                      openAIImage();

                    } else if (
                      title ===
                      "Background"
                    ) {
                      openBackground();

                    } else {
                      action(
                        `${title} workspace coming soon.`
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

          </div>

          <div className="empty-project">

            <div className="empty-mark">
              ＋
            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Your creative projects
              will appear here.
            </p>

            <button
              className="primary-btn small"
              onClick={() =>
                openAIImage()
              }
            >
              Create your first project
            </button>

          </div>

        </section>

        <footer>
          SN STUDIO
          <span> • </span>
          AI Creative Workspace
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
