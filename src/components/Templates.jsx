import "../styles/components.css";

const templateCards = [
  { name: "Product Reel", tag: "Marketing", accent: "#7b61ff" },
  { name: "Podcast Cover", tag: "Branding", accent: "#3dd7b7" },
  { name: "Course Promo", tag: "Education", accent: "#f6b24d" },
  { name: "Portfolio Grid", tag: "Creatives", accent: "#7ee7b0" },
];

function Templates() {
  return (
    <section className="templates-section" id="templates">
      <div className="section-header">
        <div>
          <span className="eyebrow">Templates</span>
          <h2>Start faster</h2>
        </div>
        <button className="text-btn" type="button">
          View all
        </button>
      </div>

      <div className="template-grid">
        {templateCards.map((card) => (
          <article key={card.name} className="template-card" style={{ borderTopColor: card.accent }}>
            <div className="template-swatch" style={{ background: `linear-gradient(135deg, ${card.accent}, #111827)` }} />
            <div className="template-copy">
              <span>{card.tag}</span>
              <h3>{card.name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Templates;
