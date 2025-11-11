import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function PasswordReset() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const emailFromQuery = query.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    setSuccess(null);

    try {
      // Ensure CSRF cookie is present for the web route
      await axios.get('/sanctum/csrf-cookie');

      const payload = {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      const res = await axios.post('/reset-password', payload);

      if (res.status === 200) {
        setSuccess('Password updated successfully. Redirecting to sign-in...');
        setTimeout(() => navigate('/'), 2500);
      } else {
        setErrors(['Unexpected response from server.']);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          // validation errors
          const list = [];
          Object.values(data.errors).forEach((v) => {
            if (Array.isArray(v)) list.push(...v);
            else list.push(v);
          });
          setErrors(list);
        } else if (data.message) {
          setErrors([data.message]);
        } else if (data.error) {
          setErrors([data.error]);
        } else {
          setErrors(['An unknown error occurred.']);
        }
      } else {
        setErrors(['Network error.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, background: 'var(--bg-card, #fff)', borderRadius: 8, color: 'var(--text-color, #111)' }}>
      <h2>Event Sound Pro</h2>
      <hr/>
      <p>Set a new password for <strong>{email}</strong></p>

      {errors && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, background: 'var(--bg-card, #fff)', color: 'var(--text-color, #111)', border: '1px solid var(--border-color, #ddd)', borderRadius: 6 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>New password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, background: 'var(--bg-card, #fff)', color: 'var(--text-color, #111)', border: '1px solid var(--border-color, #ddd)', borderRadius: 6 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Confirm password</label>
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required style={{ width: '100%', padding: 8, background: 'var(--bg-card, #fff)', color: 'var(--text-color, #111)', border: '1px solid var(--border-color, #ddd)', borderRadius: 6 }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>{loading ? 'Saving...' : 'Save password'}</button>
          <button type="button" onClick={() => navigate('/')} style={{ padding: '10px 16px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
