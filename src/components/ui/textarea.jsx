export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`px-3 py-2 rounded border border-slate-300 ${className}`}
      {...props}
    />
  );
}