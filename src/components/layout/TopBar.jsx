import './TopBar.css';

const PROMOS = [
  '🔥 Burger Bonanza 20% off',
  '🍕 Pizza Party $5 off',
  '🥗 Vegan Delight new arrival',
  '💰 Save up to $10 on orders over $50',
];

export default function TopBar() {
  const ticker = [...PROMOS, ...PROMOS].join('  ·  ');

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-dot" />
        Resistencia · Free delivery over $25
      </div>

      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker">{ticker}&nbsp;&nbsp;&nbsp;&nbsp;{ticker}</div>
      </div>

      <button className="topbar-right">Change location →</button>
    </div>
  );
}