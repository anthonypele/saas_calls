import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      <header className="topbar">
        <Link className="brand" to="/calls">Call Analytics</Link>
        <nav>
          <Link to="/calls">Calls</Link>
          <Link to="/calls/new">Add Call</Link>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
