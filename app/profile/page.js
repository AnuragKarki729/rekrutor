// app/profile/page.js
'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/users') // Adjust this based on user role
      .then((res) => res.json())
      .then((data) => setProfile(data[0])) // Assume first user for now
      .catch((err) => console.error('Error fetching profile:', err));
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h1>{profile.first_name} {profile.last_name}</h1>
      <p>{profile.bio}</p>
    </div>
  );
}
