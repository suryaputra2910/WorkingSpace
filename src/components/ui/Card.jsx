export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white border border-stone/10 rounded-lg shadow-soft ${hover ? 'hover:shadow-card hover:-translate-y-0.5 transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
