"use client";

import { useState, useEffect } from "react";
import HumanModal from "../components/HumanModal";

export default function Home() {
  const [humans, setHumans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Fetch human details
  const fetchHumans = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/humans");
      if (!response.ok) {
        throw new Error("Failed to fetch human details.");
      }
      const data = await response.ok ? await response.json() : [];
      setHumans(data);
    } catch (err) {
      setError(err.message || "Failed to load database. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHumans();
  }, []);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleCreateSuccess = (newHuman) => {
    // Add toast notification
    addToast(`Successfully created profile for ${newHuman.name}!`);
    // Refresh the table
    fetchHumans();
  };

  // Compute metrics
  const totalRecords = humans.length;
  const uniqueCities = new Set(humans.map((h) => h.city.toLowerCase())).size;

  return (
    <main className="app-container">
      {/* Header section */}
      <header className="dashboard-header">
        <div>
          <h1>Human Registry</h1>
          <p className="subtitle">Real-time management dashboard for registry records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "4px" }}
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Human Record
        </button>
      </header>

      {/* Stats row */}
      <section className="stats-bar">
        <div className="glass-panel stat-card">
          <div className="stat-label">Total Registered</div>
          <div className="stat-value">{isLoading ? "..." : totalRecords}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Unique Cities</div>
          <div className="stat-value">{isLoading ? "..." : uniqueCities}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">System Status</div>
          <div className="stat-value" style={{ color: error ? "var(--danger)" : "var(--accent)" }}>
            {error ? "Offline" : "Online"}
          </div>
        </div>
      </section>

      {/* Database list / table */}
      <section className="glass-panel">
        <div className="table-container">
          {error ? (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: "var(--danger)" }}
              >
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Database Error</h3>
              <p style={{ color: "var(--text-muted)", maxWidth: "400px", marginTop: "8px", marginBottom: "16px" }}>
                {error}
              </p>
              <button className="btn btn-secondary" onClick={fetchHumans}>
                Retry Connection
              </button>
            </div>
          ) : isLoading ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td style={{ opacity: 0.3 }}>-</td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar-badge" style={{ opacity: 0.3 }}>?</div>
                        <span style={{ opacity: 0.3 }}>Loading record...</span>
                      </div>
                    </td>
                    <td style={{ opacity: 0.3 }}>Loading...</td>
                    <td>
                      <span className="city-badge" style={{ opacity: 0.3 }}>Loading...</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : humans.length === 0 ? (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3>No Human Records Found</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                Get started by adding a human detail record.
              </p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {humans.map((human) => {
                  const initials = human.name
                    ? human.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "H";
                  return (
                    <tr key={human.id}>
                      <td style={{ color: "var(--text-muted)", fontWeight: "600" }}>
                        #{human.id}
                      </td>
                      <td>
                        <div className="name-cell">
                          <div className="avatar-badge">{initials}</div>
                          {human.name}
                        </div>
                      </td>
                      <td>{human.address}</td>
                      <td>
                        <span className="city-badge">{human.city}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Creation Modal Form */}
      <HumanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleCreateSuccess}
      />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--accent)" }}
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
