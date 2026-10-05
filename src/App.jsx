import React, { useState, useRef } from "react";

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
  const [photoStudio, setPhotoStudio] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoAdjust, setPhotoAdjust] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  });
  const [photoFilter, setPhotoFilter] = useState("Original");
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoFlipX, setPhotoFlipX] = useState(false);
  const [photoFlipY, setPhotoFlipY] = useState(false);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoRatio, setPhotoRatio] = useState("Original");
  const [photoHistory, setPhotoHistory] = useState([]);
  const [photoFuture, setPhotoFuture] = useState([]);
  const photoCanvasRef = useRef(null);
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

  const openPhotoEditor = () => {
    setAiStudio(false);
    setBackgroundStudio(false);
    setPhotoStudio(true);
    setActive("Photo Editor");
  };

  const closePhotoEditor = () => {
    setPhotoStudio(false);
    setActive("Dashboard");
  };

  const photoSnapshot = () => ({
    photoAdjust: { ...photoAdjust },
    photoFilter,
    photoRotation,
    photoFlipX,
    photoFlipY,
    photoZoom,
    photoRatio,
  });

  const restorePhotoSnapshot = (snap) => {
    if (!snap) return;
    setPhotoAdjust(snap.photoAdjust);
    setPhotoFilter(snap.photoFilter);
    setPhotoRotation(snap.photoRotation);
    setPhotoFlipX(snap.photoFlipX);
    setPhotoFlipY(snap.photoFlipY);
    setPhotoZoom(snap.photoZoom);
    setPhotoRatio(snap.photoRatio);
  };

  const pushPhotoHistory = () => {
    setPhotoHistory((items) => [...items.slice(-19), photoSnapshot()]);
    setPhotoFuture([]);
  };

  const undoPhoto = () => {
    if (!photoHistory.length) return action("Nothing to undo.");
    const previous = photoHistory[photoHistory.length - 1];
    setPhotoHistory((items) => items.slice(0, -1));
    setPhotoFuture((items) => [photoSnapshot(), ...items].slice(0, 20));
    restorePhotoSnapshot(previous);
  };

  const redoPhoto = () => {
    if (!photoFuture.length) return action("Nothing to redo.");
    const next = photoFuture[0];
    setPhotoFuture((items) => items.slice(1));
    setPhotoHistory((items) => [...items.slice(-19), photoSnapshot()]);
    restorePhotoSnapshot(next);
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return action("Please select an image file.");
    if (file.size > 20 * 1024 * 1024) return action("Image must be smaller than 20 MB.");
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(url);
    setPhotoAdjust({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 });
    setPhotoFilter("Original");
    setPhotoRotation(0);
    setPhotoFlipX(false);
    setPhotoFlipY(false);
    setPhotoZoom(1);
    setPhotoRatio("Original");
    setPhotoHistory([]);
    setPhotoFuture([]);
  };

  const photoFilterCss = {
    Original: "",
    Cinematic: "contrast(112%) saturate(88%) brightness(94%) sepia(8%)",
    Portrait: "contrast(104%) saturate(105%) brightness(103%)",
    Vintage: "contrast(92%) saturate(82%) sepia(28%) brightness(104%)",
    Moody: "contrast(118%) saturate(78%) brightness(88%)",
    Warm: "sepia(16%) saturate(112%) brightness(103%)",
    Cool: "saturate(92%) hue-rotate(8deg) brightness(103%)",
    Mono: "grayscale(100%) contrast(112%)",
  };

  const photoCssFilter = `${photoFilterCss[photoFilter] || ""} brightness(${photoAdjust.brightness}%) contrast(${photoAdjust.contrast}%) saturate(${photoAdjust.saturation}%) blur(${photoAdjust.blur}px) grayscale(${photoAdjust.grayscale}%) sepia(${photoAdjust.sepia}%)`;

  const resetPhoto = () => {
    pushPhotoHistory();
    setPhotoAdjust({ brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 });
    setPhotoFilter("Original");
    setPhotoRotation(0);
    setPhotoFlipX(false);
    setPhotoFlipY(false);
    setPhotoZoom(1);
    setPhotoRatio("Original");
  };

  const exportPhoto = async (format = "image/png") => {
    if (!photoPreview) return action("Upload a photo first.");
    const image = await loadImage(photoPreview);
    const ratioMap = { "1:1": 1, "4:5": 4 / 5, "16:9": 16 / 9, "9:16": 9 / 16 };
    let w = image.naturalWidth || image.width;
    let h = image.naturalHeight || image.height;
    const target = ratioMap[photoRatio];
    if (target) {
      if (w / h > target) w = Math.round(h * target);
      else h = Math.round(w / target);
    }
    const canvas = document.createElement("canvas");
    const outW = w; const outH = h;
    const rotated = Math.abs(photoRotation % 180) === 90;
    canvas.width = rotated ? outH : outW;
    canvas.height = rotated ? outW : outH;
    const ctx = canvas.getContext("2d");
    ctx.filter = photoCssFilter.replace(/blur\([^)]*\)/, "");
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((photoRotation * Math.PI) / 180);
    ctx.scale(photoFlipX ? -1 : 1, photoFlipY ? -1 : 1);
    const scale = Math.max(canvas.width / outW, canvas.height / outH) * photoZoom;
    ctx.drawImage(image, -outW * scale / 2, -outH * scale / 2, outW * scale, outH * scale);
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const link = document.createElement("a");
    link.href = canvas.toDataURL(format, format === "image/png" ? undefined : 0.92);
    link.download = `sn-studio-edit.${ext}`;
    link.click();
    action(`Exported as ${ext.toUpperCase()} ✦`);
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
      const formData = new FormData();
      formData.append("image", backgroundFile);

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
          data.error || "Background removal failed."
        );
      }

      if (data.image) {
        setBackgroundResult(data.image);
        action("Background removed successfully! ✦");
        return;
      }

      const segments = Array.isArray(data.result)
        ? data.result
        : Array.isArray(data.mask)
        ? data.mask
        : [];

      if (!segments.length) {
        throw new Error("No background mask was returned by the AI service.");
      }

      const bestSegment = [...segments].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      )[0];

      const mask = bestSegment.mask || bestSegment;

      if (!mask || typeof mask !== "string") {
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

  if (photoStudio) {
    const setAdjust = (key, value) => {
      pushPhotoHistory();
      setPhotoAdjust((prev) => ({ ...prev, [key]: Number(value) }));
      setPhotoFilter("Original");
    };

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand"><div className="brand-mark">SN</div><div><div className="brand-name">SN STUDIO</div><div className="brand-sub">Creative workspace</div></div></div>
          <div className="workspace-label">WORKSPACE</div>
          <nav className="nav-list">
            {nav.map(([label, icon]) => (
              <button key={label} className={`nav-item ${active === label ? "selected" : ""}`} onClick={() => {
                if (label === "Dashboard") closePhotoEditor();
                else if (label === "AI Tools") openAIImage();
                else if (label === "Photo Editor") setActive("Photo Editor");
                else action(`${label} workspace coming soon.`);
              }}><span className="nav-icon">{icon}</span><span>{label}</span></button>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <button className="nav-item" onClick={() => action("Settings coming soon.")}><span className="nav-icon">⚙</span><span>Settings</span></button>
          <div className="profile-card"><div className="avatar">S</div><div className="profile-copy"><strong>Sangram</strong><span>Free workspace</span></div><span className="dots">•••</span></div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <div><div className="eyebrow">PHOTO EDITING TOOL</div><h1>Photo Editor</h1></div>
            <div className="top-actions">
              <button className="secondary-btn" onClick={undoPhoto}>↶ Undo</button>
              <button className="secondary-btn" onClick={redoPhoto}>↷ Redo</button>
              <button className="upgrade-btn" onClick={() => exportPhoto("image/png")}>Export</button>
            </div>
          </header>

          <section className="ai-workspace" style={{paddingTop: 18}}>
            <div className="ai-header">
              <div><button className="text-btn" onClick={closePhotoEditor}>← Back to Dashboard</button><h2>Professional Photo Editor</h2><p>Edit locally in your browser — fast, private and API-free.</p></div>
              <div className="ai-badge">◈ PHOTO EDITOR</div>
            </div>

            {!photoPreview ? (
              <div className="upload-card" style={{minHeight: 420, display:"grid", placeItems:"center", textAlign:"center"}}>
                <div><div style={{fontSize:52, marginBottom:12}}>◈</div><h3>Start editing a photo</h3><p>PNG, JPG or WebP · up to 20 MB</p><label className="primary-btn" style={{display:"inline-flex", cursor:"pointer", marginTop:14}}>Upload Photo<input type="file" accept="image/*" onChange={handlePhotoFile} hidden /></label></div>
              </div>
            ) : (
              <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) 320px", gap:18, alignItems:"stretch"}}>
                <div className="preview-card" style={{minHeight:600, padding:18, background:"#11131a", borderRadius:20, display:"flex", flexDirection:"column"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}><strong>Canvas</strong><div style={{display:"flex", gap:8}}><button className="secondary-btn" onClick={() => setPhotoZoom(Math.max(.5, photoZoom-.1))}>−</button><span style={{padding:"10px 4px", minWidth:52, textAlign:"center"}}>{Math.round(photoZoom*100)}%</span><button className="secondary-btn" onClick={() => setPhotoZoom(Math.min(2, photoZoom+.1))}>+</button></div></div>
                  <div style={{flex:1, minHeight:500, display:"grid", placeItems:"center", overflow:"hidden", borderRadius:16, background:"repeating-conic-gradient(#20232d 0 25%, #181a22 0 50%) 50% / 22px 22px"}}>
                    <img src={photoPreview} alt="Editing preview" style={{maxWidth:"90%", maxHeight:"90%", objectFit:"contain", filter:photoCssFilter, transform:`rotate(${photoRotation}deg) scale(${photoZoom}) scaleX(${photoFlipX ? -1 : 1}) scaleY(${photoFlipY ? -1 : 1})`, transition:"filter .15s, transform .15s"}} />
                  </div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:12}}>
                    <button className="secondary-btn" onClick={() => {pushPhotoHistory(); setPhotoRotation((v)=>v-90)}}>↺ Rotate</button>
                    <button className="secondary-btn" onClick={() => {pushPhotoHistory(); setPhotoFlipX(v=>!v)}}>↔ Flip X</button>
                    <button className="secondary-btn" onClick={() => {pushPhotoHistory(); setPhotoFlipY(v=>!v)}}>↕ Flip Y</button>
                    <button className="secondary-btn" onClick={resetPhoto}>Reset</button>
                  </div>
                </div>

                <aside style={{background:"#11131a", borderRadius:20, padding:18, maxHeight:650, overflowY:"auto"}}>
                  <div style={{fontWeight:800, marginBottom:14}}>Adjustments</div>
                  {[["Brightness","brightness",40,160], ["Contrast","contrast",40,160], ["Saturation","saturation",0,180], ["Blur","blur",0,12], ["Grayscale","grayscale",0,100], ["Sepia","sepia",0,100]].map(([label,key,min,max]) => <label key={key} style={{display:"block", marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span>{label}</span><span>{photoAdjust[key]}{key === "blur" ? "px" : "%"}</span></div><input type="range" min={min} max={max} value={photoAdjust[key]} onChange={(e)=>setAdjust(key,e.target.value)} style={{width:"100%"}} /></label>)}
                  <div style={{fontWeight:800, margin:"22px 0 10px"}}>Presets</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{["Original","Cinematic","Portrait","Vintage","Moody","Warm","Cool","Mono"].map((f)=><button key={f} className="secondary-btn" onClick={()=>{pushPhotoHistory();setPhotoFilter(f)}} style={{padding:"10px 8px"}}>{f}</button>)}</div>
                  <div style={{fontWeight:800, margin:"22px 0 10px"}}>Crop ratio</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{["Original","1:1","4:5","16:9","9:16"].map((r)=><button key={r} className={`secondary-btn ${photoRatio===r ? "selected" : ""}`} onClick={()=>{pushPhotoHistory();setPhotoRatio(r)}}>{r}</button>)}</div>
                  <div style={{fontWeight:800, margin:"22px 0 10px"}}>Export</div>
                  <div style={{display:"grid",gap:8}}><button className="primary-btn" onClick={()=>exportPhoto("image/png")}>Download PNG</button><button className="secondary-btn" onClick={()=>exportPhoto("image/jpeg")}>Download JPG</button><button className="secondary-btn" onClick={()=>exportPhoto("image/webp")}>Download WebP</button></div>
                </aside>
              </div>
            )}
          </section>
          <footer>SN STUDIO <span>•</span> Professional Photo Workspace</footer>
        </main>
        {notice && <div className="toast">{notice}</div>}
      </div>
    );
  }

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

                } else if (label === "Photo Editor") {

                  openPhotoEditor();

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
