import React, { useState, useMemo } from 'react';

export default function ParticipantTable({ participants, userRole, userEmail }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    cohort: '',
    phase: '',
    advocate: '',
    gpmsStatus: '',
  });

  const phases = ['Phase 1', 'Phase 2', 'Phase 3'];

  const filtered = useMemo(() => {
    return participants.filter(p => {
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase());
      const cohortMatch = filters.cohort ? p.cohort === filters.cohort : true;
      const phaseMatch = filters.phase
        ? (filters.phase === 'Phase 1' && p.phase1ReleaseDate) ||
          (filters.phase === 'Phase 2' && p.phase2ReleaseDate) ||
          (filters.phase === 'Phase 3' && p.phase3ReleaseDate)
        : true;
      const advocateMatch = userRole === 'admin' && filters.advocate
        ? p.advocateName === filters.advocate
        : true;
      const gpmsStatusMatch = filters.gpmsStatus
        ? p.gpmsStatus === filters.gpmsStatus
        : true;

      return nameMatch && cohortMatch && phaseMatch && advocateMatch && gpmsStatusMatch;
    });
  }, [participants, search, filters, userRole]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container my-5 p-4 shadow-sm rounded bg-white">
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="col-md-3">
          <select
            name="cohort"
            value={filters.cohort}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">All Cohorts</option>
            {[...new Set(participants.map(p => p.cohort).filter(Boolean))].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            name="phase"
            value={filters.phase}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">All Phases</option>
            {phases.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {userRole === 'admin' && (
          <div className="col-md-3">
            <select
              name="advocate"
              value={filters.advocate}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Advocates</option>
              {[...new Set(participants.map(p => p.advocateName).filter(Boolean))].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-3">
          <select
            name="gpmsStatus"
            value={filters.gpmsStatus}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">All Statuses</option>
            {[...new Set(participants.map(p => p.gpmsStatus).filter(Boolean))].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              {userRole === 'admin' && <th>Advocate</th>}
              <th>Age</th>
              <th>Cohort</th>
              <th>GPMS Status</th>
              <th>Phases</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={userRole === 'admin' ? 7 : 6}
                  className="text-center text-muted"
                >
                  No participants found
                </td>
              </tr>
            )}
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.firstName} {p.lastName}</td>
                {userRole === 'admin' && <td>{p.advocateName}</td>}
                <td>{p.age ?? 'N/A'}</td>
                <td>{p.cohort || 'N/A'}</td>
                <td>{p.gpmsStatus || 'N/A'}</td>
                <td>
                  {p.phase1ReleaseDate && '1 '}
                  {p.phase2ReleaseDate && '2 '}
                  {p.phase3ReleaseDate && '3 '}
                </td>
                <td>
                  <a
                    href={`/participant/${p.id}`}
                    className="btn btn-link p-0"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
