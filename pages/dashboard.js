import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          const userDocRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { role } = userDoc.data();
            setUserRole(role);

            const querySnapshot = await getDocs(collection(db, 'participants'));
            const data = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

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
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          {/* Left Spacer */}
          <div className="col-md-2 d-none d-md-block" />

          {/* Main Content */}
          <div className="col-12 col-md-8">
            {/* Navigation Header */}
            <div className="bg-primary text-white rounded p-3 mb-4 d-flex justify-content-between align-items-center">
              <div><strong>Dashboard</strong></div>
              <div className="text-center">Welcome: {userEmail}</div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => router.push('/add-participant')}
                >
                  + Add New
                </button>
                <LogoutButton className="btn btn-sm btn-outline-light" />
              </div>
            </div>

            {/* Participant Table */}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ParticipantTable
                participants={participants}
                userRole={userRole}
                userEmail={userEmail}
              />
            )}
          </div>

          {/* Right Spacer */}
          <div className="col-md-2 d-none d-md-block" />
        </div>
      </div>
    </AuthGuard>
  );
}
