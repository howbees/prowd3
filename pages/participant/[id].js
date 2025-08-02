import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
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

  const [caseNotes, setCaseNotes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [newNote, setNewNote] = useState('');
  const [newExpense, setNewExpense] = useState({ amount: '', description: '' });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'participants', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setParticipant({ id: docSnap.id, ...docSnap.data() });
        }

        const notesRef = collection(db, 'participants', id, 'caseNotes');
        const expensesRef = collection(db, 'participants', id, 'expenses');

        const notesSnap = await getDocs(query(notesRef, orderBy('createdAt', 'desc')));
        const expensesSnap = await getDocs(query(expensesRef, orderBy('createdAt', 'desc')));

        setCaseNotes(notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setExpenses(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setIsEditable(false);
    } catch (err) {
      console.error('Error saving participant:', err);
      setSaveMessage('❌ Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    const ref = collection(db, 'participants', id, 'caseNotes');
    await addDoc(ref, {
      text: newNote,
      createdAt: new Date()
    });
    setNewNote('');
    const notesSnap = await getDocs(query(ref, orderBy('createdAt', 'desc')));
    setCaseNotes(notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addExpense = async () => {
    const { amount, description } = newExpense;
    if (!amount || !description) return;
    const ref = collection(db, 'participants', id, 'expenses');
    await addDoc(ref, {
      amount,
      description,
      createdAt: new Date()
    });
    setNewExpense({ amount: '', description: '' });
    const expensesSnap = await getDocs(query(ref, orderBy('createdAt', 'desc')));
    setExpenses(expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const fieldGroups = {
    "General Info": ["firstName", "lastName", "age", "sex", "race", "cohort", "advocateName"],
    "GPMS Status": ["gpmsId", "gpmsStatus", "bopRegister", "referralSummary"],
    "Transfers": ["transferredFrom", "transferredTo", "lastDateOfContact"],
    "Phases": [
      "phase1Instructor", "phase1ReleaseDate",
      "phase2ReleaseDate", "phase3ReleaseDate",
      "mathPreNumerator", "mathPreDenominator",
      "mathPostNumerator", "mathPostDenominator",
      "readingPreNumerator", "readingPreDenominator",
      "readingPostNumerator", "readingPostDenominator"
    ]
  };

  const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  const dateFields = new Set([
    "lastDateOfContact", "phase1ReleaseDate", "phase2ReleaseDate", "phase3ReleaseDate"
  ]);

  const dropdowns = {
    sex: ["Male", "Female", "Other"],
    phase1Instructor: ["Instructor A", "Instructor B"],
    cohort: ["Spring", "Summer", "Fall", "Winter"],
    gpmsStatus: ["Active", "Inactive", "Pending"]
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!participant) return <div className="text-center py-5">Participant not found.</div>;

  return (
    <AuthGuard>
      <div className="container py-3">
        <div className="row">
          <div className="col-md-2" />
          <div className="col-md-8">

            {/* Header */}
            <div className="bg-primary text-white d-flex justify-content-between align-items-center px-3 py-2 rounded mb-3">
              <Link href="/dashboard" className="text-white text-decoration-none fw-semibold">Dashboard</Link>
              <LogoutButton className="btn btn-sm btn-outline-light" />
            </div>

            {/* Title + Edit */}
            <div className="d-flex justify-content-between align-items-center mb-3">
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

            {/* Grouped Fields */}
            {Object.entries(fieldGroups).map(([section, fields]) => (
              <div key={section} className="mb-4">
                <h6 className="text-primary border-bottom pb-1">{section}</h6>
                <div className="row">
                  {fields.map((field) => {
                    const value = participant[field] ?? '';
                    return (
                      <div className="col-6 mb-2" key={field}>
                        <label className="form-label fw-bold small">{formatLabel(field)}</label>
                        {isEditable ? (
                          dropdowns[field] ? (
                            <select
                              className="form-select form-select-sm"
                              value={value}
                              onChange={e => handleChange(field, e.target.value)}
                            >
                              <option value="">Select</option>
                              {dropdowns[field].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : dateFields.has(field) ? (
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={value ? new Date(value.seconds * 1000).toISOString().split('T')[0] : ''}
                              onChange={e => handleChange(field, new Date(e.target.value))}
                            />
                          ) : (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={value}
                              onChange={e => handleChange(field, e.target.value)}
                            />
                          )
                        ) : (
                          <div>{dateFields.has(field) ? formatDate(value) : value}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Save Button */}
            {isEditable && (
              <div className="d-grid gap-2 mb-4">
                <button onClick={handleSave} disabled={saving} className="btn btn-success">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {saveMessage && (
              <div className={`alert ${saveMessage.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">
                {saveMessage}
              </div>
            )}

            {/* Subcollections: Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                  Case Notes
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                  Expenses
                </button>
              </li>
            </ul>

            {/* Notes Section */}
            {activeTab === 'notes' && (
              <div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add new case note"
                  />
                  <button onClick={addNote} className="btn btn-sm btn-primary mt-2">Add Note</button>
                </div>
                <ul className="list-group">
                  {caseNotes.map(note => (
                    <li className="list-group-item" key={note.id}>
                      <div className="small text-muted">{formatDate(note.createdAt)}</div>
                      <div>{note.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expenses Section */}
            {activeTab === 'expenses' && (
              <div>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <button onClick={addExpense} className="btn btn-sm btn-primary">Add Expense</button>
                </div>
                <ul className="list-group">
                  {expenses.map(exp => (
                    <li className="list-group-item" key={exp.id}>
                      <div className="small text-muted">{formatDate(exp.createdAt)}</div>
                      <div>${exp.amount} – {exp.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
          <div className="col-md-2" />
        </div>
      </div>
    </AuthGuard>
  );
}
