import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

export default function Sidebar({ items, footer, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-paper border-r border-stone/10 shadow-elevated md:shadow-none
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="relative flex h-24 items-center justify-center border-b border-stone/10 shrink-0">
          <img
            src="/workingspace.png"
            alt="logo"
            className="h-30 w-40 object-contain"
          />

          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone transition-colors hover:bg-stone/10 hover:text-ink md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-forest/10 text-forest shadow-sm'
                  : 'text-stone hover:bg-stone/10 hover:text-ink'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {footer && (
          <div className="mt-auto border-t border-stone/10 bg-cream/30 p-4 shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </>
  )
}
