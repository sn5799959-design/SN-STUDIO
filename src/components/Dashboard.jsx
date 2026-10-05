import "../styles/components.css";

function Dashboard() {
  return (
    <section className="workspace-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h2>Creative dashboard</h2>
        </div>
        <button className="text-btn" type="button">
          Open workspace
        </button>
      </div>

      <div className="stats-grid">
        <article className="dashboard-card wide">
          <div className="card-topline">
            <span>Current project</span>
            <span className="status-pill">Live</span>
          </div>
          <h3>Launch Visual</h3>
          <div className="track-lines">
            <span style={{ width: "78%" }} />
          </div>
          <div className="mini-meta">
            <span>Render status: Ready</span>
            <strong>78%</strong>
          </div>
        </article>

        <article className="dashboard-card">
          <span className="card-label">Project queue</span>
          <strong>12</strong>
          <p>Pending submissions</p>
        </article>

        <article className="dashboard-card">
          <span className="card-label">AI prompts</span>
          <strong>186</strong>
          <p>Concept variations</p>
        </article>

        <article className="dashboard-card">
          <span className="card-label">Exports</span>
          <strong>3.4k</strong>
          <p>Downloads this month</p>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
