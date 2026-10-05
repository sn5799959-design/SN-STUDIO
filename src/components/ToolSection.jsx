import "../styles/components.css";

const toolCards = [
  { icon: "◉", title: "Video Editor", desc: "Cut, trim, color grade, and publish cinematic edits." },
  { icon: "⬣", title: "Photo Editor", desc: "Retouch portraits, assemble collages, and clean up visuals." },
  { icon: "⬤", title: "Document Editor", desc: "Format manuscripts, proposals, and presentation-ready PDFs." },
  { icon: "✦", title: "Thumbnail Maker", desc: "Build attention-grabbing concepts for YouTube and social media." },
  { icon: "✧", title: "AI Tools", desc: "Generate ideas, crop variations, and concept visuals quickly." },
  { icon: "⬖", title: "Templates", desc: "Launch branded layouts and reusable creative building blocks." },
];

function ToolSection() {
  return (
    <section className="tool-section" id="video-editor">
      <div className="section-header">
        <div>
          <span className="eyebrow">All tools</span>
          <h2>Creative engine</h2>
        </div>
        <button className="text-btn" type="button">
          Explore tools
        </button>
      </div>

      <div className="tool-grid">
        {toolCards.map((tool) => (
          <button key={tool.title} className="tool-card" type="button">
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-copy">
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </div>
            <span className="tool-arrow">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ToolSection;
