import React, { useState, useRef } from 'react';
import API from '../api/axios';

const INITIAL_FORM = {
  vehicleNo: '',
  licenseNumber: '',
  companyName: '',
  ownerName: '',
  mobileNo: '',
  address: '',
  licenseFromDate: '',
  licenseToDate: '',
  advanceAmount: '',
  totalAmount: '',
};

const VEHICLE_NO_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/i;

const VehicleForm = ({ vehicle, onClose }) => {
  const [form, setForm] = useState(
    vehicle
      ? {
          vehicleNo: vehicle.vehicleNo || '',
          licenseNumber: vehicle.licenseNumber || '',
          companyName: vehicle.companyName || '',
          ownerName: vehicle.ownerName || '',
          mobileNo: vehicle.mobileNo || '',
          address: vehicle.address || '',
          licenseFromDate: vehicle.licenseFromDate || '',
          licenseToDate: vehicle.licenseToDate || '',
          advanceAmount: vehicle.advanceAmount || '',
          totalAmount: vehicle.totalAmount || '',
        }
      : INITIAL_FORM
  );

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const vehicleNoRef = useRef(null);
  const mobileNoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.vehicleNo.trim()) {
      newErrors.vehicleNo = 'Vehicle No. is required.';
    } else if (!VEHICLE_NO_REGEX.test(form.vehicleNo.trim())) {
      newErrors.vehicleNo = 'Invalid format. Use format: MH12AB1234';
    }

    if (form.mobileNo && form.mobileNo.trim().length > 0) {
      if (!/^\d{10}$/.test(form.mobileNo.trim())) {
        newErrors.mobileNo = 'Mobile No. must be exactly 10 digits.';
      }
    }

    setErrors(newErrors);

    // Scroll to the first error field
    if (newErrors.vehicleNo && vehicleNoRef.current) {
      vehicleNoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      vehicleNoRef.current.focus();
    } else if (newErrors.mobileNo && mobileNoRef.current) {
      mobileNoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mobileNoRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status) => {
    setSubmitError('');
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = { ...form, status };
      if (vehicle?.id) {
        await API.put(`/vehicles/${vehicle.id}`, payload);
      } else {
        await API.post('/vehicles', payload);
      }
      setSuccess(status === 'SUBMITTED' ? 'Record submitted successfully!' : 'Record saved as draft!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setSubmitError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-container-header">
        <h2>{vehicle ? 'Edit Vehicle Record' : 'Add New Vehicle Record'}</h2>
        <button onClick={onClose} className="btn-back">← Back to List</button>
      </div>

      {submitError && <div className="error-msg">{submitError}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="form-grid">

        <div className="form-group">
          <label>Vehicle No. <span className="required">*</span></label>
          <input
            ref={vehicleNoRef}
            type="text"
            name="vehicleNo"
            value={form.vehicleNo}
            onChange={handleChange}
            placeholder="e.g. MH12AB1234"
            className={errors.vehicleNo ? 'field-error' : ''}
          />
          {errors.vehicleNo && <span className="field-error-msg">{errors.vehicleNo}</span>}
        </div>

        <div className="form-group">
          <label>Driving License Number</label>
          <input
            type="text"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            placeholder="e.g. MH1234567890"
          />
        </div>

        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Company name"
          />
        </div>

        <div className="form-group">
          <label>Vehicle Owner Name</label>
          <input
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="Owner's full name"
          />
        </div>

        <div className="form-group">
          <label>Mobile No.</label>
          <input
            ref={mobileNoRef}
            type="tel"
            name="mobileNo"
            value={form.mobileNo}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            className={errors.mobileNo ? 'field-error' : ''}
          />
          {errors.mobileNo && <span className="field-error-msg">{errors.mobileNo}</span>}
        </div>

        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full address"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Contract From Date</label>
          <input
            type="date"
            name="licenseFromDate"
            value={form.licenseFromDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Contract To Date</label>
          <input
            type="date"
            name="licenseToDate"
            value={form.licenseToDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Advance Amount (₹)</label>
          <input
            type="number"
            name="advanceAmount"
            value={form.advanceAmount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Total Amount (₹)</label>
          <input
            type="number"
            name="totalAmount"
            value={form.totalAmount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

      </div>

      <div className="form-actions">
        <button onClick={() => handleSave('DRAFT')} className="btn-draft" disabled={saving}>
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button onClick={() => handleSave('SUBMITTED')} className="btn-submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit'}
        </button>
        <button onClick={onClose} className="btn-cancel" disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VehicleForm;
