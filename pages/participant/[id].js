import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import LogoutButton from '../../components/LogoutButton';

export default function ParticipantPage() {
  const router = useRouter();
  const { id } = router.query;

  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

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
    } catch (err) {
      console.error('Error saving participant:', err);
      setSaveMessage('❌ Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (!participant) return <div className="text-center">Participant not found.</div>;

  const fieldOrder = [
    "firstName",
    "lastName",
    "age",
    "sex",
    "race",
    "cohort",
    "gpmsId",
    "gpmsStatus",
    "bopRegister",
    "referralSummary",
    "advocateName",
    "transferredFrom",
    "transferredTo",
    "lastDateOfContact",
    "phase1Instructor",
    "phase1ReleaseDate",
    "phase2ReleaseDate",
    "phase3ReleaseDate",
    "mathPreNumerator",
    "mathPreDenominator",
    "mathPostNumerator",
    "mathPostDenominator",
    "readingPreNumerator",
    "readingPreDenominator",
    "readingPostNumerator",
    "readingPostDenominator"
  ];

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // capitalize first letter
  };

  return (
    <AuthGuard>
      <div className="container py-5">
        <div className="row">
          {/* Left Empty Column */}
          <div className="col-md-3 d-none d-md-block">
            {/* Can be used for something like additional info, if needed */}
          </div>

          {/* Center Column for the Form */}
          <div className="col-12 col-md-6">
            <LogoutButton />
            <h2 className="mb-4 text-center">Edit Participant: {participant.firstName} {participant.lastName}</h2>

            <form>
              {fieldOrder.map((field) => {
                const value = participant[field] ?? '';
                return (
                  <div key={field} className="mb-3">
                    <label className="form-label">{formatLabel(field)}:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={value}
                      onChange={e => handleChange(field, e.target.value)}
                    />
                  </div>
                );
              })}
            </form>

            <div className="d-flex justify-content-between align-items-center">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

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

          {/* Right Empty Column */}
          <div className="col-md-3 d-none d-md-block">
            {/* This can be used for any additional content, like navigation or info */}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
