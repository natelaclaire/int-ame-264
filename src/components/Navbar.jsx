import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className={`navbar ${isOpen ? 'open' : ''}`}>
      <div className="brand">INT/AME 264</div>
      <button
        className="navbar-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
      </button>
      <nav>
        <NavLink to="/" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/learning-outcomes" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Learning Outcomes</NavLink>
        <NavLink to="/modules" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Modules</NavLink>
        <NavLink to="/assignments" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Assignments</NavLink>
        <NavLink to="/syllabi" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Syllabi</NavLink>
      </nav>
    </header>
  )
}
