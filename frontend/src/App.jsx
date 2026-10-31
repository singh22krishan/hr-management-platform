import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const sections = ["employees", "jobs", "departments"];

export default function App() {
  const [section, setSection] = useState("employees");
  const [data, setData] = useState({ employees: [], jobs: [], departments: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const endpoint = useMemo(() => `${API_BASE}/api/${section}`, [section]);

  async function loadSection(target = section) {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/${target}`);
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const payload = await response.json();
      setData((current) => ({ ...current, [target]: payload }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSection(section);
  }, [section]);

  const rows = data[section] || [];
  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Full-Stack Portfolio Project</p>
          <h1>HR Management Platform</h1>
          <p className="subtitle">
            React + Node.js + Express + Oracle/PLSQL application for employee, job, and department workflows.
          </p>
        </div>
        <div className="status-card">
          <span className="status-dot" />
          API: {API_BASE}
        </div>
      </header>

      <nav className="tabs" aria-label="HR data sections">
        {sections.map((name) => (
          <button
            key={name}
            className={section === name ? "tab active" : "tab"}
            onClick={() => setSection(name)}
          >
            {name[0].toUpperCase() + name.slice(1)}
          </button>
        ))}
      </nav>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{section[0].toUpperCase() + section.slice(1)}</h2>
            <p>Live data returned by the portfolio API.</p>
          </div>
          <button className="refresh" onClick={() => loadSection(section)} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {message && <div className="notice">{message}</div>}

        {!loading && !message && rows.length === 0 && (
          <div className="empty-state">
            No records returned. Configure your Oracle environment and seed the HR schema to view data.
          </div>
        )}

        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column.replaceAll("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.employee_id || row.job_id || row.department_id || index}>
                    {columns.map((column) => (
                      <td key={column}>{formatValue(row[column])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="capabilities">
        <article>
          <h3>Employee Workflows</h3>
          <p>Hire, retrieve, update, and terminate employee records through stored procedures.</p>
        </article>
        <article>
          <h3>Database Rules</h3>
          <p>Oracle PL/SQL procedures and database-side validation enforce business logic and salary rules.</p>
        </article>
        <article>
          <h3>REST Integration</h3>
          <p>Express endpoints connect the React interface to Oracle-backed HR data.</p>
        </article>
      </section>

      <footer>
        Academic software engineering portfolio project maintained as a clean standalone implementation.
      </footer>
    </main>
  );
}

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
