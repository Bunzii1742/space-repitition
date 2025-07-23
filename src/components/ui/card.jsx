export function Card({ className = "", children }) {
  return <div className={`p-4 rounded shadow ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}