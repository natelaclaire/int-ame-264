export default function Footer() {
  return (
    <footer className="footer">
      <div><span className="status-dot" /> Player one is still learning.</div>
      <p>© 2025–{new Date().getFullYear()} <a href="https://natelaclaire.dev/">Nate LaClaire</a></p>
    </footer>
  )
}
