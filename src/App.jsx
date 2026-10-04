import { useState } from "react";

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

  const action = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2500);
  };

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
              onClick={() => setActive(label)}
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
            <div className="eyebrow">CREATIVE WORKSPACE</div>
            <h1>{active}</h1>
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
                onClick={() => action("AI creation workspace coming soon.")}
              >
                ✦ Create with AI
              </button>

              <button
                className="secondary-btn"
                onClick={() => action("Project upload coming soon.")}
              >
                Upload Project
              </button>
            </div>

            <div className="mini-stats">
              <span><b>6</b> creative tools</span>
              <span><b>∞</b> ideas</span>
              <span><b>24/7</b> workspace</span>
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

              <div className="visual-center">✦</div>

              <div className="visual-bottom">
                CREATE · EDIT · INSPIRE
              </div>
            </div>
          </div>

        </section>

        <section className="section">

          <div className="section-head">
            <div>
              <div className="eyebrow">TOOLS</div>
              <h2>Start creating</h2>
            </div>

            <button
              className="text-btn"
              onClick={() => action("All tools coming soon.")}
            >
              View all →
            </button>
          </div>

          <div className="tool-grid">

            {tools.map(([title, desc, icon]) => (
              <button
                className="tool-card"
                key={title}
                onClick={() =>
                  action(`${title} selected.`)
                }
              >
                <div className="tool-icon">{icon}</div>

                <div className="tool-copy">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>

                <span className="card-arrow">↗</span>
              </button>
            ))}

          </div>

        </section>

        <section className="section projects">

          <div className="section-head">
            <div>
              <div className="eyebrow">WORKSPACE</div>
              <h2>Recent projects</h2>
            </div>

            <button
              className="text-btn"
              onClick={() => action("Project library coming soon.")}
            >
              See all →
            </button>
          </div>

          <div className="empty-project">

            <div className="empty-mark">＋</div>

            <h3>No projects yet</h3>

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
