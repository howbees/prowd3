import Link from 'next/link';

export default function ParticipantList({ participants }) {
  return (
    <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '1rem' }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>GPMS ID</th>
          <th>Cohort</th>
          <th>Advocate</th>
          <th>Age</th>
          <th>Phase 1 Instructor</th>
        </tr>
      </thead>
      <tbody>
        {participants.map(p => (
          <tr key={p.id}>
            <td>
              <Link href={`/participant/${p.id}`}>
                {p.firstName} {p.lastName}
              </Link>
            </td>
            <td>{p.gpmsId}</td>
            <td>{p.cohort || '-'}</td>
            <td>{p.advocateName || '-'}</td>
            <td>{p.age || '-'}</td>
            <td>{p.phase1Instructor || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
