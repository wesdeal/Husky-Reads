function Button({ children, variant = "primary", onClick, className = "" }) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors"

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
