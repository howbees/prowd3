import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import LogoutButton from '../../components/LogoutButton';
import Link from 'next/link';

export default function ParticipantPage() {
  const router = useRouter();
  const { id } = router.query;

  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchParticipant = async () => {
      try {
        const docRef = doc(db, 'participants', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setParticipant({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching participant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [id]);

  const handleChange = (field, value) => {
    setParticipant(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!participant) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const docRef = doc(db, 'participants', participant.id);
      const { id: _, ...data } = participant;
      await updateDoc(docRef, data);
      setSaveMessage('✅ Changes saved successfully!');
      setIsEditable(false); // Exit edit mode
    } catch (err) {
      console.error('Error saving participant:', err);
      setSaveMessage('❌ Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!participant) return <div className="text-center py-5">Participant not found.</div>;

  const fieldOrder = [
    "firstName", "lastName", "age", "sex", "race", "cohort", "gpmsId", "gpmsStatus",
    "bopRegister", "referralSummary", "advocateName", "transferredFrom", "transferredTo",
    "lastDateOfContact", "phase1Instructor", "phase1ReleaseDate", "phase2ReleaseDate",
    "phase3ReleaseDate", "mathPreNumerator", "mathPreDenominator", "mathPostNumerator",
    "mathPostDenominator", "readingPreNumerator", "readingPreDenominator",
    "readingPostNumerator", "readingPostDenominator"
  ];

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <AuthGuard>
      <style jsx>{`
        button {
          border: none;
        }
      `}</style>

      <div className="container py-3">
        <div className="row justify-content-center">
          <div className="col-md-4">

            {/* Header */}
            <div className="bg-primary text-white d-flex justify-content-between align-items-center px-3 py-2 rounded">
              <Link href="/dashboard" className="text-white text-decoration-none fw-semibold">Dashboard</Link>
              <LogoutButton className="btn btn-sm btn-outline-light" />
            </div>

            {/* Edit Button */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <h5 className="mb-0">
                {isEditable ? "Edit" : "View"} Participant: {participant.firstName} {participant.lastName}
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsEditable(!isEditable)}
              >
                {isEditable ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Form Fields */}
            <form className="mt-3">
              <div className="row">
                {fieldOrder.map((field) => {
                  const value = participant[field] ?? '';
                  return (
                    <div className="col-6 mb-2" key={field}>
                      <label className="form-label fw-bold small">{formatLabel(field)}</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={value}
                        readOnly={!isEditable}
                        onChange={e => handleChange(field, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </form>

            {/* Save Button + Message */}
            {isEditable && (
              <div className="d-grid gap-2 mt-3 position-relative">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {saveMessage && (
              <div
                className={`alert ${saveMessage.startsWith('✅') ? 'alert-success' : 'alert-danger'} mt-3`}
                role="alert"
              >
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
