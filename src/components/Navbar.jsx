import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)
  const courseRef = useRef(null)
  const courseButtonRef = useRef(null)
  const { pathname } = useLocation()
  const courseLinks = [
    ['/learning-outcomes', 'Learning Outcomes'],
    ['/modules', 'Modules'],
    ['/assignments', 'Assignments'],
    ['/syllabi', 'Syllabi'],
  ]
  const courseActive = courseLinks.some(([path]) => pathname === path || pathname.startsWith(`${path}/`))
  const closeMenu = () => {
    setIsOpen(false)
    setCourseOpen(false)
  }

  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (!courseRef.current?.contains(event.target)) setCourseOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    closeMenu()
  }, [pathname])

  return (
    <header className={`navbar ${isOpen ? 'open' : ''}`}>
      <NavLink to="/" className="brand" onClick={closeMenu} aria-label="GamingHistory.org home">
        <span className="brand-mark"><FontAwesomeIcon icon={faGamepad} /></span>
        <span className="brand-copy">
          <span className="brand-name">GamingHistory.org</span>
          <span className="brand-tagline">A companion Web site to UMA's INT/AME 264</span>
        </span>
      </NavLink>
      <button
        className="navbar-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(open => !open)
          setCourseOpen(false)
        }}
      >
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
        <span className="navbar-toggle-bar" />
      </button>
      <nav>
        <NavLink to="/" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
        <div
          className="course-menu"
          ref={courseRef}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setCourseOpen(false)
          }}
          onKeyDown={event => {
            if (event.key === 'Escape' && courseOpen) {
              event.preventDefault()
              setCourseOpen(false)
              courseButtonRef.current?.focus()
            }
          }}
        >
          <button
            ref={courseButtonRef}
            type="button"
            className={`course-toggle ${courseActive ? 'active' : ''}`}
            aria-expanded={courseOpen}
            aria-controls="course-links"
            onClick={() => setCourseOpen(open => !open)}
          >
            Course <span aria-hidden="true">{courseOpen ? '▴' : '▾'}</span>
          </button>
          <div id="course-links" className="course-links" hidden={!courseOpen}>
            {courseLinks.map(([path, label]) => (
              <NavLink key={path} to={path} onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>{label}</NavLink>
            ))}
          </div>
        </div>
        <NavLink to="/writings" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Writings</NavLink>
        <NavLink to="/radio" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}>Radio</NavLink>
      </nav>
    </header>
  )
}
