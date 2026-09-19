export default function Input({ label, error, helper, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <input
        className={`w-full border rounded-md px-3.5 py-2.5 text-sm bg-white placeholder:text-stone/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss ${error ? 'border-brick' : 'border-stone/25'
          } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-brick mt-1.5">{error}</span>}
      {helper && !error && <span className="block text-xs text-stone mt-1.5">{helper}</span>}
    </label>
  )
}
