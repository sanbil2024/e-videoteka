import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          'http://localhost:5000/api/users/profile',
          config
        );

        setUserData(data);
        setLoading(false);
      } catch (error) {
        setError('Došlo je do greške prilikom dohvaćanja podataka o korisniku.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (!user) {
    return (
      <div>
        <h1>Profil</h1>
        <p>Morate biti prijavljeni da biste vidjeli svoj profil.</p>
      </div>
    );
  }

  if (loading) return <div>Učitavanje...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile">
      <h1>Profil</h1>

      <div>
        <h2>Korisnički podaci</h2>
        <p><strong>Ime:</strong> {userData?.name || 'Nepoznato'}</p>
        <p><strong>Email:</strong> {userData?.email || 'Nepoznato'}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
