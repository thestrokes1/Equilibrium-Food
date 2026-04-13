import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line w-75" />
        <div className="skeleton-line w-50" />
        <div className="skeleton-line w-40" />
        <div className="skeleton-footer">
          <div className="skeleton-price" />
          <div className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}
