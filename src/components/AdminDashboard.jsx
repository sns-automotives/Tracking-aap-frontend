import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import VehicleForm from './VehicleForm';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
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
    fetchVehicles();
  }, [fetchVehicles]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditVehicle(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditVehicle(null);
    fetchVehicles();
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '—');
  const formatAmount = (amt) => (amt != null ? `₹${Number(amt).toLocaleString('en-IN')}` : '—');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Vehicle Tracking System — Admin</h1>
        <div className="nav-right">
          <span>Welcome, <strong>{user?.username}</strong></span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      <div className="content">
        {showForm ? (
          <VehicleForm vehicle={editVehicle} onClose={handleFormClose} />
        ) : (
          <>
            <div className="table-header">
              <h2>Vehicle Records ({vehicles.length})</h2>
              <button onClick={handleAddNew} className="btn-primary">+ Add New Vehicle</button>
            </div>

            {loading ? (
              <div className="loading">Loading records...</div>
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
                      <th>Contract From</th>
                      <th>Contract To</th>
                      <th>Advance</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Added By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="no-data">
                          No records yet. Click "Add New Vehicle" to get started.
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
                          <td>{formatDate(v.licenseFromDate)}</td>
                          <td>{formatDate(v.licenseToDate)}</td>
                          <td>{formatAmount(v.advanceAmount)}</td>
                          <td>{formatAmount(v.totalAmount)}</td>
                          <td>
                            <span className={`status-badge ${v.status?.toLowerCase()}`}>
                              {v.status}
                            </span>
                          </td>
                          <td>{v.createdBy || '—'}</td>
                          <td>
                            <button onClick={() => handleEdit(v)} className="btn-edit">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
