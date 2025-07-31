import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import ParticipantList from '../components/ParticipantList';

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, 'participants'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(data);
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Participant Dashboard</h1>
      <ParticipantList participants={participants} />
    </div>
  );
}
