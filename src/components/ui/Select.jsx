export default function Select({ label, error, options = [], placeholder, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
      <select
        className={`w-full border rounded-md px-3.5 py-2.5 text-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-moss/20 focus:border-moss ${error ? 'border-brick' : 'border-stone/25'
          } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="block text-xs text-brick mt-1.5">{error}</span>}
    </label>
  )
}
