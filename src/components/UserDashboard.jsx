import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setIsSearchMode(false);
      fetchAll();
      return;
    }
    setLoading(true);
    setIsSearchMode(true);
    try {
      const res = await API.get(`/vehicles/search?query=${encodeURIComponent(q)}`);
      setVehicles(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    fetchAll();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '—');
  const formatAmount = (amt) => (amt != null ? `₹${Number(amt).toLocaleString('en-IN')}` : '—');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Vehicle Tracking System</h1>
        <div className="nav-right">
          <span>Welcome, <strong>{user?.username}</strong></span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="search-section">
          <h2>Search Vehicle Records</h2>
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by Vehicle No., Company Name, or Owner Name..."
            />
            <button onClick={handleSearch} className="btn-primary">Search</button>
            {isSearchMode && (
              <button onClick={handleClear} className="btn-secondary">Clear</button>
            )}
          </div>
          <p className="search-hint">
            Search by Vehicle Number, Company Name, or Owner Name — press Enter or click Search
          </p>
        </div>

        <p className="results-title">
          {isSearchMode
            ? `Search results for "${searchQuery}" — ${vehicles.length} record(s) found`
            : `All Records — ${vehicles.length} total`}
        </p>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle No.</th>
                  <th>License No.</th>
                  <th>Company</th>
                  <th>Owner Name</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Contract From</th>
                  <th>Contract To</th>
                  <th>Advance</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="no-data">
                      {isSearchMode ? 'No records match your search.' : 'No vehicle records available.'}
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v, idx) => (
                    <tr key={v.id}>
                      <td>{idx + 1}</td>
                      <td><strong>{v.vehicleNo}</strong></td>
                      <td>{v.licenseNumber || '—'}</td>
                      <td>{v.companyName || '—'}</td>
                      <td>{v.ownerName || '—'}</td>
                      <td>{v.mobileNo || '—'}</td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{v.address || '—'}</td>
                      <td>{formatDate(v.licenseFromDate)}</td>
                      <td>{formatDate(v.licenseToDate)}</td>
                      <td>{formatAmount(v.advanceAmount)}</td>
                      <td>{formatAmount(v.totalAmount)}</td>
                      <td>
                        <span className={`status-badge ${v.status?.toLowerCase()}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
