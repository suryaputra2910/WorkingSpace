export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  const variants = {
    primary: 'bg-forest text-white hover:bg-moss shadow-soft hover:shadow-card',
    secondary: 'bg-sand text-ink hover:bg-wheat',
    outline: 'border border-stone/30 text-ink hover:bg-sand/60 hover:border-stone/50',
    ghost: 'text-stone hover:text-ink hover:bg-sand/50',
    danger: 'bg-brick text-white hover:bg-brick/90',
  }

  return (
    <button
      {...props}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading && (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
