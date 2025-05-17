import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [editMode, setEditMode] = useState({ name: false, email: false, password: false });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setUserData({ name: data.name || '', email: data.email || '' });
        setLoading(false);
      } catch (err) {
        setError('Greška pri dohvaćanju profila.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const updateData = {
        name: userData.name,
        email: userData.email,
      };

      if (password) updateData.password = password;

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData, config);
      setMessage('Profil je uspješno ažuriran.');
      setUserData({ name: data.name, email: data.email });
      setPassword('');
      setEditMode({ name: false, email: false, password: false });
    } catch (err) {
      setError('Greška pri ažuriranju profila.');
    }
  };

  const toggleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <div className="profile">
        <h1>Profil</h1>
        <p>Morate biti prijavljeni za pregled profila.</p>
      </div>
    );
  }

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div className="profile">
      <h1>Profil</h1>

      {message && <div style={{ color: 'lightgreen', marginBottom: '10px' }}>{message}</div>}
      {error && <div style={{ color: 'salmon', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Ime:</label>
          <div className="field-row">
            <input
              type="text"
              value={userData.name}
              readOnly={!editMode.name}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <button type="button" onClick={() => toggleEdit('name')}>
              {editMode.name ? 'Otkaži' : 'Uredi'}
            </button>
          </div>
        </div>

        <div className="field-group">
          <label>Email:</label>
          <div className="field-row">
            <input
              type="email"
              value={userData.email}
              readOnly={!editMode.email}
              onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
            />
            <button type="button" onClick={() => toggleEdit('email')}>
              {editMode.email ? 'Otkaži' : 'Uredi'}
            </button>
          </div>
        </div>

        <div className="field-group">
          <label>Lozinka:</label>
          <div className="field-row">
            <input
              type="password"
              value={password}
              placeholder="Unesite novu lozinku"
              readOnly={!editMode.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => toggleEdit('password')}>
              {editMode.password ? 'Otkaži' : 'Uredi'}
            </button>
          </div>
        </div>

        <button type="submit">Spremi promjene</button>
      </form>
    </div>
  );
};

export default ProfilePage;
