import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">INT/AME 264</div>
      <nav>
        <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/learning-outcomes" className={({isActive}) => isActive ? 'active' : ''}>Learning Outcomes</NavLink>
        <NavLink to="/modules" className={({isActive}) => isActive ? 'active' : ''}>Modules</NavLink>
      </nav>
    </header>
  )
}
