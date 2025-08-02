import { useState } from 'react';
import { useRouter } from 'next/router';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AuthGuard from '../components/AuthGuard';
import LogoutButton from '../components/LogoutButton';
import Link from 'next/link';

export default function AddParticipant() {
  const router = useRouter();

  const [participant, setParticipant] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fieldOrder = [
    "firstName", "lastName", "age", "sex", "race", "cohort", "gpmsId", "gpmsStatus",
    "bopRegister", "referralSummary", "advocateName", "transferredFrom", "transferredTo",
    "lastDateOfContact", "phase1Instructor", "phase1ReleaseDate", "phase2ReleaseDate",
    "phase3ReleaseDate", "mathPreNumerator", "mathPreDenominator", "mathPostNumerator",
    "mathPostDenominator", "readingPreNumerator", "readingPreDenominator",
    "readingPostNumerator", "readingPostDenominator"
  ];

  const dateFields = [
    'phase1ReleaseDate',
    'phase2ReleaseDate',
    'phase3ReleaseDate',
    'lastDateOfContact',
  ];

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  const handleChange = (field, value) => {
    setParticipant((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const firstName = participant.firstName?.trim().toLowerCase() || '';
    const lastName = participant.lastName?.trim().toLowerCase() || '';
    const docId = `${firstName}_${lastName}`.replace(/\s+/g, '_');

    try {
      const docRef = doc(db, 'participants', docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setError('Participant with this name already exists.');
      } else {
        await setDoc(docRef, {
          ...participant,
          createdAt: Timestamp.now(),
        });
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="container py-4">
        <div className="row">
          <div className="col-md-2" />
          <div className="col-md-8">
            {/* Header */}
            <div className="bg-primary text-white d-flex justify-content-between align-items-center px-3 py-2 rounded">
              <Link href="/dashboard" className="text-white text-decoration-none fw-semibold">
                Dashboard
              </Link>
              <LogoutButton className="btn btn-sm btn-outline-light" />
            </div>

            <h5 className="mt-4 mb-3">Add New Participant</h5>

            <form onSubmit={handleSubmit}>
              <div className="row">
                {fieldOrder.map((field) => (
                  <div key={field} className="col-6 mb-2">
                    <label className="form-label fw-bold small">
                      {field === 'advocateName' ? 'Advocate Email' : formatLabel(field)}
                    </label>
                    <input
                      type={dateFields.includes(field) ? 'date' : 'text'}
                      className="form-control form-control-sm"
                      value={participant[field] ?? ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add Participant'}
              </button>
              {error && (
                <div className="alert alert-danger mt-2" role="alert">
                  {error}
                </div>
              )}
            </form>
          </div>
          <div className="col-md-2" />
        </div>
      </div>
    </AuthGuard>
  );
}
