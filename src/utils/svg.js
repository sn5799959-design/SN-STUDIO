export function buildConceptSvg(promptText, accentColor) {
  const safePrompt = (promptText || "Cinematic creative concept").replace(/[&<>"']/g, "").substring(0, 50);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#0d111a" offset="0%"/>
          <stop stop-color="#171b2c" offset="40%"/>
          <stop stop-color="#0d111a" offset="100%"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${accentColor}" offset="0%"/>
          <stop stop-color="#8ef0d9" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="966" cy="180" r="230" fill="${accentColor}" opacity="0.18"/>
      <circle cx="1048" cy="265" r="170" fill="#ffffff" opacity="0.08"/>
      <rect x="100" y="130" width="360" height="84" rx="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <text x="140" y="182" fill="#eef1ff" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700">SN STUDIO</text>
      <rect x="100" y="260" width="610" height="370" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)"/>
      <rect x="150" y="310" width="220" height="220" rx="22" fill="url(#accent)" opacity="0.85"/>
      <circle cx="750" cy="410" r="150" fill="${accentColor}" opacity="0.14"/>
      <rect x="710" y="290" width="330" height="170" rx="22" fill="rgba(255,255,255,0.04)"/>
      <text x="150" y="660" fill="#f6f7fb" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="800">Create. Edit. Inspire.</text>
      <text x="150" y="728" fill="#c8cee5" font-family="Segoe UI, Arial, sans-serif" font-size="26">${safePrompt}</text>
      <rect x="830" y="690" width="220" height="58" rx="29" fill="rgba(255,255,255,0.06)"/>
      <text x="868" y="728" fill="#eef1ff" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600">AI Ready</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
