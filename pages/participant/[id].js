import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';

export default function ParticipantDetail() {
  const { id } = useRouter().query;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function fetchParticipant() {
      const docRef = doc(db, 'participants', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    }
    fetchParticipant();
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{data.firstName} {data.lastName}</h2>
      <p><strong>GPMS ID:</strong> {data.gpmsId}</p>
      <p><strong>Age:</strong> {data.age}</p>
      <p><strong>Cohort:</strong> {data.cohort}</p>
      <p><strong>Advocate:</strong> {data.advocateName}</p>
      <p><strong>Phase 1 Instructor:</strong> {data.phase1Instructor}</p>
      <p><strong>Phase 1 Release Date:</strong> {data.phase1ReleaseDate?.toDate?.().toString() || 'N/A'}</p>
      {/* Add more fields as needed */}
    </div>
  );
}
