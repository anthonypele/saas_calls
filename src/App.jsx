import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      <header className="topbar">
        <Link className="brand" to="/conversaciones">Conversaciones</Link>
        <nav>
          <Link to="/conversaciones">Conversaciones</Link>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
