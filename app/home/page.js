// app/home/page.js
'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/positions')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error('Error fetching positions:', err));
  }, []);

  return (
    <div>
      <h1>Job Positions</h1>
      <ul>
        {data.map((position) => (
          <li key={position.position_id}>
            <h2>{position.title}</h2>
            <p>{position.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
