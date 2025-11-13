import { useState } from 'react'

export default function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="tooltip" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span role="tooltip" className="tooltip-content">{label}</span>
      )}
    </span>
  )
}
