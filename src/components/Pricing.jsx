import "../styles/components.css";

const pricingPlans = [
  { name: "Starter", price: "$29", detail: "Per month", features: ["1 active project", "Essentials toolkit", "Export in HD", "Email support"] },
  { name: "Pro Studio", price: "$79", detail: "Per month", highlight: true, features: ["Unlimited project tabs", "AI concept generation", "Commercial export", "Priority support"] },
  { name: "Agency", price: "$169", detail: "Per month", features: ["Team collaboration", "Brand presets", "Custom templates", "Dedicated onboarding"] },
];

function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-header">
        <div>
          <span className="eyebrow">Pricing</span>
          <h2>Built for creators</h2>
        </div>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article key={plan.name} className={`price-card ${plan.highlight ? "featured" : ""}`}>
            <span className="plan-name">{plan.name}</span>
            <div className="price-row">
              <strong>{plan.price}</strong>
              <small>{plan.detail}</small>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button type="button" className={plan.highlight ? "primary-btn" : "ghost-btn"}>
              Choose plan
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
