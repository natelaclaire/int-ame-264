import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  const location = useLocation()
  return (
    <div className="site-shell">
      <Navbar />
      <main className="container page-transition" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
      <div className="scanlines" aria-hidden="true" />
    </div>
  )
}
