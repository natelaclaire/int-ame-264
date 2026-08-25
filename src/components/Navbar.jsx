import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className={`navbar ${isOpen ? 'open' : ''}`}>
      <NavLink to="/" className="brand" onClick={closeMenu} aria-label="INT AME 264 home">
        <span className="brand-mark"><FontAwesomeIcon icon={faGamepad} /></span><span>INT/AME 264</span>
      </NavLink>
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
        <NavLink to="/writings" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Writings</NavLink>
        <NavLink to="/radio" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Radio</NavLink>
      </nav>
    </header>
  )
}
