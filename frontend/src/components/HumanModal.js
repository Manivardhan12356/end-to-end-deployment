"use client";

import { useState } from "react";

export default function HumanModal({ isOpen, onClose, onSubmitSuccess }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://157.230.40.93:30080/api/humans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }

      // Clear form on success
      setName("");
      setAddress("");
      setCity("");

      onSubmitSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Human Profile</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="e.g. Liam Sterling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              className="form-input"
              placeholder="e.g. 10 Downing Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              type="text"
              id="city"
              className="form-input"
              placeholder="e.g. London"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ minWidth: "120px" }}
            >
              {isLoading ? <div className="spinner" /> : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
