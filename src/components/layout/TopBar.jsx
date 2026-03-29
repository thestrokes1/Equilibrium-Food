import './TopBar.css';

const PROMOS = [
  '🔥 Burger Bonanza 20% off',
  '🍕 Pizza Party $5 off',
  '🥗 Vegan Delight new arrival',
  '💰 Save up to $10 on orders over $50',
  '🔥 Burger Bonanza 20% off',
  '🍕 Pizza Party $5 off',
];

export default function TopBar() {
  const ticker = [...PROMOS, ...PROMOS].join('  ·  ');

  return (
    <div className="topbar">

      {/* LEFT — promo ticker, takes all remaining space */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker">{ticker}&nbsp;&nbsp;&nbsp;&nbsp;{ticker}</div>
      </div>

      {/* RIGHT — location always visible, shrinks on mobile */}
      <button className="topbar-location">
        <span className="topbar-dot" />
        <span className="location-full">Resistencia · Free delivery over $25</span>
        <span className="location-short">Resistencia</span>
      </button>

    </div>
  );
}