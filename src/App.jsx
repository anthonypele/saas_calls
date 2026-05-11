import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/conversaciones">Conversaciones</Link>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
