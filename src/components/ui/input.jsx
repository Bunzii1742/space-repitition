export function Input({ className = "", ...props }) {
  return (
    <input
      className={`px-3 py-2 rounded border border-slate-300 ${className}`}
      {...props}
    />
  );
}