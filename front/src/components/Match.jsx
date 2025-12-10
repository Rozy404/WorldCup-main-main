// src/components/Match.jsx
export default function Match({ left, right, onSelect }) {
  return (
    <div className="match-container">
      <div className="movie" onClick={() => onSelect(left)}>
        <img src={left.img} alt={left.name} />
        <p>{left.name}</p>
      </div>

      <h2>VS</h2>

      <div className="movie" onClick={() => onSelect(right)}>
        <img src={right.img} alt={right.name} />
        <p>{right.name}</p>
      </div>
    </div>
  );
}
