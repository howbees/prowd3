import React, { useEffect, useState } from 'react';

import ParticipantTable from '../components/ParticipantTable';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AuthGuard from '../components/AuthGuard';
import LogoutButton from '../components/LogoutButton';

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          // 1. Get role from Firestore
          const userDocRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { role } = userDoc.data();
            setUserRole(role);

            // 2. Fetch participants
            const querySnapshot = await getDocs(collection(db, 'participants'));
            const data = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // 3. Filter if user is advocate
            const filtered = role === 'advocate'
              ? data.filter(p => p.advocateName?.trim().toLowerCase() === user.email.toLowerCase())
              : data;

            setParticipants(filtered);
          } else {
            console.warn("User role not found in Firestore.");
            setUserRole(null);
            setParticipants([]);
          }
        } catch (error) {
          console.error("Firestore error:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthGuard>
      <div style={{ padding: '20px' }}>
        <LogoutButton />
        <h1>Dashboard – {userRole?.toUpperCase()}</h1>
        {loading
          ? <p>Loading...</p>
          : <ParticipantTable
              participants={participants}
              userRole={userRole}
              userEmail={userEmail}
            />}
            
      </div>
    </AuthGuard>
  );
}
