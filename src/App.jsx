
import React, { useState, useEffect } from 'react';

// --- Constants ---
const ROLES = {
  POLICYHOLDER: 'POLICYHOLDER',
  CLAIMS_OFFICER: 'CLAIMS_OFFICER',
  VERIFICATION_OFFICER: 'VERIFICATION_OFFICER',
  FINANCE_TEAM: 'FINANCE_TEAM',
  ADMIN: 'ADMIN',
};

const STATUS_MAPPING = {
  SUBMITTED: { label: 'Submitted', color: 'var(--status-submitted)' },
  IN_REVIEW: { label: 'In Review', color: 'var(--status-in-review)' },
  PENDING_DOCS: { label: 'Pending Docs', color: 'var(--status-pending)' },
  VERIFIED: { label: 'Verified', color: 'var(--status-success)' },
  REJECTED: { label: 'Rejected', color: 'var(--status-danger)' },
  APPROVED: { label: 'Approved', color: 'var(--status-approved)' },
  SETTLED: { label: 'Settled', color: 'var(--status-settled)' },
  DRAFT: { label: 'Draft', color: 'var(--status-draft)' },
  ESCALATED: { label: 'Escalated', color: 'var(--status-escalated)' },
};

const CLAIM_WORKFLOW = [
  { stage: 'SUBMITTED', label: 'Submitted', roles: [ROLES.POLICYHOLDER] },
  { stage: 'IN_REVIEW', label: 'Review', roles: [ROLES.CLAIMS_OFFICER] },
  { stage: 'PENDING_DOCS', label: 'Docs Required', roles: [ROLES.VERIFICATION_OFFICER, ROLES.CLAIMS_OFFICER] },
  { stage: 'VERIFIED', label: 'Verified', roles: [ROLES.VERIFICATION_OFFICER] },
  { stage: 'APPROVED', label: 'Approved', roles: [ROLES.CLAIMS_OFFICER] },
  { stage: 'SETTLED', label: 'Settled', roles: [ROLES.FINANCE_TEAM] },
];

// --- Dummy Data ---
const MOCK_USERS = [
  { id: 'usr001', name: 'Alice Smith', email: 'alice.s@example.com', role: ROLES.POLICYHOLDER },
  { id: 'usr002', name: 'Bob Johnson', email: 'bob.j@example.com', role: ROLES.CLAIMS_OFFICER },
  { id: 'usr003', name: 'Charlie Brown', email: 'charlie.b@example.com', role: ROLES.VERIFICATION_OFFICER },
  { id: 'usr004', name: 'Diana Prince', email: 'diana.p@example.com', role: ROLES.FINANCE_TEAM },
  { id: 'usr005', name: 'Clark Kent', email: 'clark.k@example.com', role: ROLES.ADMIN },
  { id: 'usr006', name: 'Eve Adams', email: 'eve.a@example.com', role: ROLES.POLICYHOLDER },
];

const MOCK_POLICIES = [
  { id: 'pol001', policyNumber: 'LIFE-987654', type: 'Life Insurance', holderId: 'usr001', status: 'ACTIVE' },
  { id: 'pol002', policyNumber: 'AUTO-123456', type: 'Auto Insurance', holderId: 'usr006', status: 'ACTIVE' },
  { id: 'pol003', policyNumber: 'HOME-789012', type: 'Home Insurance', holderId: 'usr001', status: 'INACTIVE' },
  { id: 'pol004', policyNumber: 'LIFE-654321', type: 'Life Insurance', holderId: 'usr006', status: 'ACTIVE' },
];

const MOCK_CLAIMS = [
  {
    id: 'clm001',
    policyId: 'pol001',
    claimNumber: 'CLM-2023-0001',
    type: 'Death Benefit',
    description: 'Claim filed for death of primary policyholder due to natural causes.',
    status: 'APPROVED',
    amount: 150000,
    submittedBy: 'usr001',
    submittedDate: '2023-01-15',
    lastUpdated: '2023-03-20',
    assignedTo: 'usr002',
    documents: [{ name: 'Death Certificate.pdf', url: '/docs/doc1.pdf' }, { name: 'Claim Form.pdf', url: '/docs/doc2.pdf' }],
    workflowStage: 'APPROVED',
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-01-15T10:00:00Z', actor: 'usr001', action: 'Submitted Claim', details: 'Claim CLM-2023-0001 created.' },
      { timestamp: '2023-01-16T11:30:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
      { timestamp: '2023-02-01T14:00:00Z', actor: 'usr003', action: 'Documents Verified', details: 'All supporting documents checked.' },
      { timestamp: '2023-03-20T09:45:00Z', actor: 'usr002', action: 'Approved Claim', details: 'Claim approved for full amount.' },
    ],
  },
  {
    id: 'clm002',
    policyId: 'pol002',
    claimNumber: 'CLM-2023-0002',
    type: 'Vehicle Damage',
    description: 'Minor collision damage to front bumper.',
    status: 'IN_REVIEW',
    amount: 2500,
    submittedBy: 'usr006',
    submittedDate: '2023-02-01',
    lastUpdated: '2023-02-05',
    assignedTo: 'usr002',
    documents: [{ name: 'Accident Report.pdf', url: '/docs/doc3.pdf' }, { name: 'Repair Estimate.pdf', url: '/docs/doc4.pdf' }],
    workflowStage: 'IN_REVIEW',
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-02-01T10:00:00Z', actor: 'usr006', action: 'Submitted Claim', details: 'Claim CLM-2023-0002 created.' },
      { timestamp: '2023-02-01T10:30:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
    ],
  },
  {
    id: 'clm003',
    policyId: 'pol001',
    claimNumber: 'CLM-2023-0003',
    type: 'Accidental Injury',
    description: 'Injury sustained from a fall at home.',
    status: 'PENDING_DOCS',
    amount: 5000,
    submittedBy: 'usr001',
    submittedDate: '2023-02-10',
    lastUpdated: '2023-02-15',
    assignedTo: 'usr003',
    documents: [{ name: 'Medical Report.pdf', url: '/docs/doc5.pdf' }],
    workflowStage: 'PENDING_DOCS',
    slaStatus: 'BREACHED',
    auditLog: [
      { timestamp: '2023-02-10T10:00:00Z', actor: 'usr001', action: 'Submitted Claim', details: 'Claim CLM-2023-0003 created.' },
      { timestamp: '2023-02-11T11:00:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
      { timestamp: '2023-02-15T09:00:00Z', actor: 'usr003', action: 'Requested Additional Documents', details: 'Awaiting doctor\'s note and hospital bill.' },
    ],
  },
  {
    id: 'clm004',
    policyId: 'pol003',
    claimNumber: 'CLM-2023-0004',
    type: 'Property Damage',
    description: 'Water damage in kitchen due to burst pipe.',
    status: 'REJECTED',
    amount: 10000,
    submittedBy: 'usr001',
    submittedDate: '2023-03-01',
    lastUpdated: '2023-03-10',
    assignedTo: 'usr002',
    documents: [{ name: 'Damage Photos.zip', url: '/docs/doc6.zip' }],
    workflowStage: 'IN_REVIEW', // Rejected during review
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-03-01T10:00:00Z', actor: 'usr001', action: 'Submitted Claim', details: 'Claim CLM-2023-0004 created.' },
      { timestamp: '2023-03-02T11:00:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
      { timestamp: '2023-03-10T14:00:00Z', actor: 'usr002', action: 'Rejected Claim', details: 'Claim rejected due to policy exclusions.' },
    ],
  },
  {
    id: 'clm005',
    policyId: 'pol004',
    claimNumber: 'CLM-2023-0005',
    type: 'Medical Expense',
    description: 'Emergency hospitalization for appendicitis.',
    status: 'SUBMITTED',
    amount: 7500,
    submittedBy: 'usr006',
    submittedDate: '2023-04-01',
    lastUpdated: '2023-04-01',
    assignedTo: null,
    documents: [{ name: 'Hospital Bill.pdf', url: '/docs/doc7.pdf' }],
    workflowStage: 'SUBMITTED',
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-04-01T10:00:00Z', actor: 'usr006', action: 'Submitted Claim', details: 'Claim CLM-2023-0005 created.' },
    ],
  },
  {
    id: 'clm006',
    policyId: 'pol002',
    claimNumber: 'CLM-2023-0006',
    type: 'Theft',
    description: 'Theft of vehicle parts from parked car.',
    status: 'VERIFIED',
    amount: 1200,
    submittedBy: 'usr006',
    submittedDate: '2023-04-05',
    lastUpdated: '2023-04-10',
    assignedTo: 'usr003',
    documents: [{ name: 'Police Report.pdf', url: '/docs/doc8.pdf' }, { name: 'Photo Evidence.zip', url: '/docs/doc9.zip' }],
    workflowStage: 'VERIFIED',
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-04-05T10:00:00Z', actor: 'usr006', action: 'Submitted Claim', details: 'Claim CLM-2023-0006 created.' },
      { timestamp: '2023-04-06T11:00:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
      { timestamp: '2023-04-08T14:00:00Z', actor: 'usr003', action: 'Verification Initiated', details: 'Verification Officer Charlie Brown assigned.' },
      { timestamp: '2023-04-10T10:00:00Z', actor: 'usr003', action: 'Claim Verified', details: 'All documents and claim details verified.' },
    ],
  },
  {
    id: 'clm007',
    policyId: 'pol001',
    claimNumber: 'CLM-2023-0007',
    type: 'Disability Income',
    description: 'Long-term disability claim due to chronic illness.',
    status: 'SETTLED',
    amount: 25000,
    submittedBy: 'usr001',
    submittedDate: '2023-01-01',
    lastUpdated: '2023-04-15',
    assignedTo: 'usr004',
    documents: [{ name: 'Medical History.pdf', url: '/docs/doc10.pdf' }],
    workflowStage: 'SETTLED',
    slaStatus: 'ON_TRACK',
    auditLog: [
      { timestamp: '2023-01-01T09:00:00Z', actor: 'usr001', action: 'Submitted Claim', details: 'Claim CLM-2023-0007 created.' },
      { timestamp: '2023-01-05T10:00:00Z', actor: 'usr002', action: 'Moved to In Review', details: 'Assigned to Claims Officer Bob Johnson.' },
      { timestamp: '2023-03-01T14:00:00Z', actor: 'usr003', action: 'Claim Verified', details: 'All documents and claim details verified.' },
      { timestamp: '2023-03-15T16:00:00Z', actor: 'usr002', action: 'Approved Claim', details: 'Claim approved for partial settlement.' },
      { timestamp: '2023-04-15T10:00:00Z', actor: 'usr004', action: 'Claim Settled', details: 'Payment processed and settlement completed.' },
    ],
  },
];

const MOCK_AUDIT_LOGS = [
  ...MOCK_CLAIMS.flatMap(claim => claim.auditLog?.map(log => ({ ...log, entityId: claim.id, entityType: 'Claim' })) || []),
  { timestamp: '2023-01-01T08:00:00Z', actor: 'usr005', action: 'User Created', details: 'User Alice Smith (usr001) created.', entityType: 'User', entityId: 'usr001' },
  { timestamp: '2023-01-02T09:00:00Z', actor: 'usr005', action: 'Policy Updated', details: 'Policy LIFE-987654 (pol001) status changed to ACTIVE.', entityType: 'Policy', entityId: 'pol001' },
];

function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.ADMIN); // Default to Admin for full demo
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'ALL', type: 'ALL' });
  const [newClaimFormData, setNewClaimFormData] = useState({
    policyId: '',
    type: '',
    description: '',
    amount: '',
    documents: [],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Simulate real-time updates for dashboard
    const interval = setInterval(() => {
      // Example: Randomly update a claim's lastUpdated date or slaStatus
      setClaims(prevClaims => {
        const updatedClaims = prevClaims.map(claim => {
          if (Math.random() < 0.2) { // 20% chance to update a claim
            return {
              ...claim,
              lastUpdated: new Date().toISOString().slice(0, 10), // Just date part
              slaStatus: Math.random() < 0.1 ? 'BREACHED' : 'ON_TRACK', // Small chance of SLA breach
            };
          }
          return claim;
        });
        return updatedClaims;
      });
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navigate = (screen, params = {}) => {
    setView({ screen, params });
    setSearchTerm(''); // Clear search on navigation
    setFilters({ status: 'ALL', type: 'ALL' }); // Clear filters
    setFormErrors({}); // Clear form errors
  };

  const goBack = () => {
    // Simple back navigation logic based on current screen
    const currentScreen = view.screen;
    switch (currentScreen) {
      case 'CLAIM_DETAIL':
      case 'CLAIM_FORM':
        navigate('CLAIM_LIST');
        break;
      case 'POLICY_DETAIL':
        navigate('POLICY_LIST');
        break;
      case 'USER_MANAGEMENT':
        navigate('DASHBOARD');
        break;
      case 'SETTINGS':
        navigate('DASHBOARD');
        break;
      default:
        navigate('DASHBOARD');
        break;
    }
  };

  const handleLogout = () => {
    // Simulate logout by resetting role and navigating to a login/dashboard state
    setCurrentUserRole(ROLES.POLICYHOLDER); // Or 'GUEST'
    navigate('DASHBOARD');
    alert('Logged out successfully!');
  };

  const canAccess = (requiredRoles) => {
    return requiredRoles.includes(currentUserRole);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Dashboard', screen: 'DASHBOARD' }];
    switch (view.screen) {
      case 'CLAIM_LIST':
        breadcrumbs.push({ label: 'Claims', screen: 'CLAIM_LIST' });
        break;
      case 'CLAIM_DETAIL':
        breadcrumbs.push({ label: 'Claims', screen: 'CLAIM_LIST' });
        breadcrumbs.push({ label: `Claim ${view.params?.claimNumber}`, screen: 'CLAIM_DETAIL', params: view.params });
        break;
      case 'CLAIM_FORM':
        breadcrumbs.push({ label: 'Claims', screen: 'CLAIM_LIST' });
        breadcrumbs.push({ label: view.params?.claimId ? 'Edit Claim' : 'New Claim', screen: 'CLAIM_FORM', params: view.params });
        break;
      case 'POLICY_LIST':
        breadcrumbs.push({ label: 'Policies', screen: 'POLICY_LIST' });
        break;
      case 'POLICY_DETAIL':
        breadcrumbs.push({ label: 'Policies', screen: 'POLICY_LIST' });
        breadcrumbs.push({ label: `Policy ${view.params?.policyNumber}`, screen: 'POLICY_DETAIL', params: view.params });
        break;
      case 'USER_MANAGEMENT':
        breadcrumbs.push({ label: 'User Management', screen: 'USER_MANAGEMENT' });
        break;
      case 'SETTINGS':
        breadcrumbs.push({ label: 'Settings', screen: 'SETTINGS' });
        break;
      default:
        break;
    }
    return breadcrumbs;
  };

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  const getFilteredClaims = () => {
    let filtered = claims;

    if (canAccess([ROLES.POLICYHOLDER])) {
      const policyholder = MOCK_USERS.find(user => user.id === 'usr001'); // Assuming Alice is current policyholder for demo
      const policyholderPolicies = policies.filter(policy => policy.holderId === policyholder?.id).map(p => p.id);
      filtered = filtered.filter(claim => policyholderPolicies.includes(claim.policyId));
    }

    if (searchTerm) {
      filtered = filtered.filter(claim =>
        claim.claimNumber.toLowerCase().includes(searchTerm) ||
        claim.description.toLowerCase().includes(searchTerm) ||
        claim.type.toLowerCase().includes(searchTerm) ||
        claim.status.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === filters.status);
    }

    if (filters.type !== 'ALL') {
      filtered = filtered.filter(claim => claim.type === filters.type);
    }

    return filtered;
  };

  const getFilteredPolicies = () => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(policy =>
        policy.policyNumber.toLowerCase().includes(searchTerm) ||
        policy.type.toLowerCase().includes(searchTerm) ||
        policy.status.toLowerCase().includes(searchTerm)
      );
    }
    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      );
    }
    return filtered;
  };

  const getPolicyById = (id) => policies.find(p => p.id === id);
  const getUserById = (id) => users.find(u => u.id === id);

  // --- Form Handlers ---
  const handleNewClaimFormChange = (e) => {
    const { name, value } = e.target;
    setNewClaimFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewClaimFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }))]
    }));
  };

  const validateClaimForm = () => {
    const errors = {};
    if (!newClaimFormData.policyId) errors.policyId = 'Policy is required.';
    if (!newClaimFormData.type) errors.type = 'Claim type is required.';
    if (!newClaimFormData.description || newClaimFormData.description.length < 10) errors.description = 'Description must be at least 10 characters.';
    if (!newClaimFormData.amount || parseFloat(newClaimFormData.amount) <= 0) errors.amount = 'Amount must be a positive number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    if (!validateClaimForm()) {
      return;
    }

    const newClaim = {
      id: `clm${String(claims.length + 1).padStart(3, '0')}`,
      policyId: newClaimFormData.policyId,
      claimNumber: `CLM-2023-${String(claims.length + 1).padStart(4, '0')}`,
      type: newClaimFormData.type,
      description: newClaimFormData.description,
      status: 'SUBMITTED',
      amount: parseFloat(newClaimFormData.amount),
      submittedBy: 'usr001', // Assuming policyholder Alice
      submittedDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      assignedTo: null,
      documents: newClaimFormData.documents,
      workflowStage: 'SUBMITTED',
      slaStatus: 'ON_TRACK',
      auditLog: [{ timestamp: new Date().toISOString(), actor: 'usr001', action: 'Submitted Claim', details: `Claim CLM-2023-${String(claims.length + 1).padStart(4, '0')} created.` }],
    };

    setClaims(prevClaims => [...prevClaims, newClaim]);
    setNewClaimFormData({
      policyId: '',
      type: '',
      description: '',
      amount: '',
      documents: [],
    });
    alert('Claim submitted successfully!');
    navigate('CLAIM_LIST');
  };

  const handleUpdateClaimStatus = (claimId, newStatus) => {
    setClaims(prevClaims =>
      prevClaims.map(claim =>
        claim.id === claimId
          ? {
              ...claim,
              status: newStatus,
              workflowStage: newStatus, // Simplified: workflowStage matches status
              lastUpdated: new Date().toISOString().slice(0, 10),
              auditLog: [
                ...(claim.auditLog || []),
                { timestamp: new Date().toISOString(), actor: currentUserRole, action: `Status changed to ${newStatus}`, details: `Claim status updated to ${newStatus}.` }
              ]
            }
          : claim
      )
    );
    alert(`Claim ${claimId} status updated to ${STATUS_MAPPING[newStatus]?.label}!`);
  };

  // --- Components for Rendering Different Screens ---

  const renderDashboard = () => {
    const recentClaims = claims.slice(0, 5).sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    const pendingClaimsCount = claims.filter(c => c.status === 'PENDING_DOCS' || c.status === 'IN_REVIEW').length;
    const approvedClaimsCount = claims.filter(c => c.status === 'APPROVED' || c.status === 'SETTLED').length;
    const totalClaims = claims.length;

    const claimTypeData = claims.reduce((acc, claim) => {
      acc[claim.type] = (acc[claim.type] || 0) + 1;
      return acc;
    }, {});

    const claimStatusData = claims.reduce((acc, claim) => {
      acc[STATUS_MAPPING[claim.status]?.label || 'Unknown'] = (acc[STATUS_MAPPING[claim.status]?.label || 'Unknown'] || 0) + 1;
      return acc;
    }, {});

    const recentActivities = MOCK_AUDIT_LOGS
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);


    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
            <button className="action-button" style={{ backgroundColor: 'var(--color-info)' }} onClick={() => alert('Exporting dashboard data...')}>
              Export Reports
            </button>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-widget">
            <h5 className="dashboard-widget-title">
              Overall Claim Status <span className="widget-live-indicator"></span>
            </h5>
            <div className="chart-placeholder">
              <p>Donut Chart (Status Distribution)</p>
              <ul>
                {Object.entries(claimStatusData).map(([status, count]) => (
                  <li key={status}>{status}: {count}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dashboard-widget">
            <h5 className="dashboard-widget-title">Claims by Type</h5>
            <div className="chart-placeholder">
              <p>Bar Chart (Claim Type Distribution)</p>
              <ul>
                {Object.entries(claimTypeData).map(([type, count]) => (
                  <li key={type}>{type}: {count}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dashboard-widget">
            <h5 className="dashboard-widget-title">Processing Timelines</h5>
            <div className="chart-placeholder">
              <p>Line Chart (Average Processing Time)</p>
              <p>Sample Data: Jan: 10 days, Feb: 12 days, Mar: 9 days</p>
            </div>
          </div>

          <div className="dashboard-widget">
            <h5 className="dashboard-widget-title">Workload Distribution</h5>
            <div className="chart-placeholder">
              <p>Gauge Chart (Claims Assigned)</p>
              <p>Bob Johnson: {claims.filter(c => c.assignedTo === 'usr002').length} claims</p>
            </div>
          </div>

          <div className="dashboard-widget" style={{ gridColumn: 'span 2' }}>
            <h5 className="dashboard-widget-title">
              Recent Claims
              <span className="widget-live-indicator"></span>
              <button className="action-button" style={{ backgroundColor: 'var(--color-secondary)' }} onClick={() => navigate('CLAIM_LIST')}>View All</button>
            </h5>
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {recentClaims.map(claim => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  policy={getPolicyById(claim.policyId)}
                  onClick={() => navigate('CLAIM_DETAIL', { claimId: claim.id, claimNumber: claim.claimNumber })}
                />
              ))}
            </div>
          </div>

          <div className="dashboard-widget">
            <h5 className="dashboard-widget-title">Recent Activities</h5>
            <ul className="recent-activity-list">
              {recentActivities.map((activity, index) => (
                <li key={activity.timestamp + '-' + index} className="recent-activity-item">
                  <span><strong>{getUserById(activity.actor)?.name || activity.actor}</strong> {activity.action}</span>
                  <span style={{ color: 'var(--color-gray-500)' }}>{new Date(activity.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderClaimList = () => {
    const filteredClaims = getFilteredClaims();
    const claimTypes = [...new Set(claims.map(c => c.type))];
    const claimStatuses = [...new Set(Object.keys(STATUS_MAPPING))];

    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Claims</h1>
          {(canAccess([ROLES.POLICYHOLDER]) || canAccess([ROLES.ADMIN])) && (
            <button className="action-button" onClick={() => navigate('CLAIM_FORM')}>
              + New Claim
            </button>
          )}
        </div>

        <div className="flex-row gap-md mb-lg align-center">
          <input
            type="text"
            className="form-input"
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '300px' }}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Statuses</option>
            {claimStatuses.map(status => (
              <option key={status} value={status}>
                {STATUS_MAPPING[status]?.label}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Types</option>
            {claimTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button className="action-button button-secondary" onClick={() => setFilters({ status: 'ALL', type: 'ALL' })}>
            Clear Filters
          </button>
          {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
            <button className="action-button" style={{backgroundColor: 'var(--color-info)'}} onClick={() => alert('Exporting claims to Excel/PDF...')}>
              Export
            </button>
          )}
          {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
            <button className="action-button" style={{backgroundColor: 'var(--color-secondary)'}} onClick={() => alert('Bulk actions menu opened.')}>
              Bulk Actions
            </button>
          )}
        </div>

        {(filteredClaims.length > 0) ? (
          <div className="card-grid">
            {filteredClaims.map(claim => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                policy={getPolicyById(claim.policyId)}
                onClick={() => navigate('CLAIM_DETAIL', { claimId: claim.id, claimNumber: claim.claimNumber })}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <h3 className="empty-state-title">No Claims Found</h3>
            <p className="empty-state-description">
              It looks like there are no claims matching your criteria. Try adjusting your search or filters.
            </p>
            {(canAccess([ROLES.POLICYHOLDER]) || canAccess([ROLES.ADMIN])) && (
              <button className="action-button" onClick={() => navigate('CLAIM_FORM')}>
                Submit New Claim
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderClaimDetail = () => {
    const claim = claims.find(c => c.id === view.params?.claimId);
    if (!claim) {
      return (
        <div className="main-content">
          <h2 className="page-title">Claim Not Found</h2>
          <p>The claim you are looking for does not exist.</p>
          <button className="action-button" onClick={() => navigate('CLAIM_LIST')}>Back to Claims</button>
        </div>
      );
    }

    const policy = getPolicyById(claim.policyId);
    const policyholder = getUserById(policy?.holderId);
    const assignedOfficer = getUserById(claim.assignedTo);
    const submittedByUser = getUserById(claim.submittedBy);

    const currentWorkflowIndex = CLAIM_WORKFLOW.findIndex(stage => stage.stage === claim.workflowStage);

    return (
      <div className="main-content">
        <div className="detail-view">
          <div className="detail-header">
            <h2 className="detail-title">Claim #{claim.claimNumber}</h2>
            <span className="detail-status-badge" style={{ backgroundColor: STATUS_MAPPING[claim.status]?.color }}>
              {STATUS_MAPPING[claim.status]?.label}
            </span>
          </div>

          <div className="detail-actions">
            <button className="action-button" onClick={goBack}>Back to Claims</button>
            {(canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN])) && (
              <>
                <button
                  className="action-button"
                  style={{ backgroundColor: 'var(--color-warning)' }}
                  onClick={() => handleUpdateClaimStatus(claim.id, 'PENDING_DOCS')}
                  disabled={claim.status === 'PENDING_DOCS'}
                >
                  Request Docs
                </button>
                <button
                  className="action-button"
                  style={{ backgroundColor: 'var(--color-success)' }}
                  onClick={() => handleUpdateClaimStatus(claim.id, 'APPROVED')}
                  disabled={claim.status === 'APPROVED'}
                >
                  Approve Claim
                </button>
                <button
                  className="action-button"
                  style={{ backgroundColor: 'var(--color-danger)' }}
                  onClick={() => handleUpdateClaimStatus(claim.id, 'REJECTED')}
                  disabled={claim.status === 'REJECTED'}
                >
                  Reject Claim
                </button>
              </>
            )}
            {canAccess([ROLES.FINANCE_TEAM, ROLES.ADMIN]) && claim.status === 'APPROVED' && (
              <button
                className="action-button"
                style={{ backgroundColor: 'var(--status-settled)' }}
                onClick={() => handleUpdateClaimStatus(claim.id, 'SETTLED')}
                disabled={claim.status === 'SETTLED'}
              >
                Settle Claim
              </button>
            )}
            {(canAccess([ROLES.POLICYHOLDER, ROLES.CLAIMS_OFFICER, ROLES.ADMIN])) && (
              <button
                className="action-button button-secondary"
                onClick={() => alert(`Opening inline editing for claim ${claim.claimNumber}`)}
              >
                Edit Claim
              </button>
            )}
          </div>

          <h3 className="detail-section-title" style={{ marginTop: 'var(--spacing-xl)' }}>
            Workflow Tracker
            {claim.slaStatus === 'BREACHED' && <span className="workflow-sla breached">(SLA Breached!)</span>}
          </h3>
          <div className="workflow-tracker">
            {CLAIM_WORKFLOW.map((stage, index) => (
              <div
                key={stage.stage}
                className={`workflow-stage ${index <= currentWorkflowIndex ? (index === currentWorkflowIndex ? 'active' : 'completed') : ''}`}
              >
                <div className="workflow-stage-icon">
                  {index < currentWorkflowIndex ? '✓' : index + 1}
                </div>
                <div className="workflow-stage-label">{stage.label}</div>
                {(stage.stage === claim.workflowStage) && (
                  <div className={`workflow-sla ${claim.slaStatus === 'BREACHED' ? 'breached' : 'on-track'}`}>
                    {claim.slaStatus === 'BREACHED' ? 'Overdue' : 'On Track'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="detail-section-grid detail-section-grid-2-col">
            <div className="detail-section">
              <h4 className="detail-section-title">Claim Details</h4>
              <div className="detail-item">
                <span className="detail-label">Claim Type</span>
                <span className="detail-value">{claim.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description</span>
                <span className="detail-value">{claim.description}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount</span>
                <span className="detail-value">${claim.amount?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted Date</span>
                <span className="detail-value">{claim.submittedDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">{claim.lastUpdated}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted By</span>
                <span className="detail-value">{submittedByUser?.name || 'N/A'} ({submittedByUser?.role || ''})</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Assigned To</span>
                <span className="detail-value">{assignedOfficer?.name || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">Related Policy</h4>
              <div className="detail-item">
                <span className="detail-label">Policy Number</span>
                <span
                  className="detail-value link"
                  onClick={() => navigate('POLICY_DETAIL', { policyId: policy?.id, policyNumber: policy?.policyNumber })}
                >
                  {policy?.policyNumber || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Policy Type</span>
                <span className="detail-value">{policy?.type || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Policy Holder</span>
                <span className="detail-value">{policyholder?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Policy Status</span>
                <span className="detail-value">{policy?.status || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">Supporting Documents</h4>
              {(claim.documents && claim.documents.length > 0) ? (
                claim.documents.map((doc, index) => (
                  <div key={index} className="detail-item flex-row align-center gap-sm">
                    <span style={{ fontSize: 'var(--font-size-lg)' }}>📎</span>
                    <span className="detail-value link" onClick={() => alert(`Previewing ${doc.name}`)}>
                      {doc.name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="detail-value">No documents uploaded.</p>
              )}
            </div>

            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.ADMIN]) && (
              <div className="detail-section">
                <h4 className="detail-section-title">Audit Log</h4>
                <ul className="audit-log-list">
                  {(claim.auditLog && claim.auditLog.length > 0) ? (
                    claim.auditLog.map((log, index) => (
                      <li key={index} className="audit-log-item">
                        <strong>{getUserById(log.actor)?.name || log.actor}</strong> {log.action}
                        <span>on {new Date(log.timestamp).toLocaleString()}</span>
                        <p>{log.details}</p>
                      </li>
                    ))
                  ) : (
                    <p className="detail-value">No audit entries for this claim.</p>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderClaimForm = () => {
    const availablePolicies = canAccess([ROLES.ADMIN])
      ? policies
      : policies.filter(p => p.holderId === 'usr001'); // Policyholder can only see their own policies

    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Submit New Claim</h1>
        </div>

        <form onSubmit={handleSubmitClaim} className="form">
          <div className="form-group">
            <label htmlFor="policyId" className="form-label required">Policy Number</label>
            <select
              id="policyId"
              name="policyId"
              className="form-select"
              value={newClaimFormData.policyId}
              onChange={handleNewClaimFormChange}
              required
            >
              <option value="">Select a Policy</option>
              {availablePolicies.map(policy => (
                <option key={policy.id} value={policy.id}>
                  {policy.policyNumber} - {policy.type}
                </option>
              ))}
            </select>
            {formErrors.policyId && <p className="form-error">{formErrors.policyId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label required">Claim Type</label>
            <input
              type="text"
              id="type"
              name="type"
              className="form-input"
              value={newClaimFormData.type}
              onChange={handleNewClaimFormChange}
              placeholder="e.g., Vehicle Damage, Death Benefit"
              required
            />
            {formErrors.type && <p className="form-error">{formErrors.type}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label required">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={newClaimFormData.description}
              onChange={handleNewClaimFormChange}
              placeholder="Provide a detailed description of the claim event."
              required
            ></textarea>
            {formErrors.description && <p className="form-error">{formErrors.description}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label required">Claim Amount ($)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={newClaimFormData.amount}
              onChange={handleNewClaimFormChange}
              placeholder="e.g., 5000"
              required
              min="0"
              step="0.01"
            />
            {formErrors.amount && <p className="form-error">{formErrors.amount}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Supporting Documents</label>
            <div className="file-upload-wrapper" onClick={() => document.getElementById('file-upload-input')?.click()}>
              <input
                type="file"
                id="file-upload-input"
                name="documents"
                multiple
                onChange={handleFileUpload}
              />
              <span className="file-upload-label">Click to upload files or drag and drop</span>
              {(newClaimFormData.documents && newClaimFormData.documents.length > 0) && (
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  {newClaimFormData.documents.map((doc, index) => (
                    <div key={index} className="file-upload-preview">
                      📎 {doc.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button button-secondary" onClick={() => navigate('CLAIM_LIST')}>
              Cancel
            </button>
            <button type="submit" className="action-button">
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderPolicyList = () => {
    const filteredPolicies = getFilteredPolicies();
    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Policies</h1>
        </div>

        <div className="flex-row gap-md mb-lg align-center">
          <input
            type="text"
            className="form-input"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '300px' }}
          />
          {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
            <button className="action-button" style={{backgroundColor: 'var(--color-info)'}} onClick={() => alert('Exporting policies to Excel/PDF...')}>
              Export
            </button>
          )}
        </div>

        {(filteredPolicies.length > 0) ? (
          <div className="card-grid">
            {filteredPolicies.map(policy => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                policyholder={getUserById(policy.holderId)}
                onClick={() => navigate('POLICY_DETAIL', { policyId: policy.id, policyNumber: policy.policyNumber })}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <h3 className="empty-state-title">No Policies Found</h3>
            <p className="empty-state-description">
              It looks like there are no policies matching your criteria.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPolicyDetail = () => {
    const policy = policies.find(p => p.id === view.params?.policyId);
    if (!policy) {
      return (
        <div className="main-content">
          <h2 className="page-title">Policy Not Found</h2>
          <p>The policy you are looking for does not exist.</p>
          <button className="action-button" onClick={() => navigate('POLICY_LIST')}>Back to Policies</button>
        </div>
      );
    }

    const policyholder = getUserById(policy.holderId);
    const relatedClaims = claims.filter(c => c.policyId === policy.id);

    return (
      <div className="main-content">
        <div className="detail-view">
          <div className="detail-header">
            <h2 className="detail-title">Policy #{policy.policyNumber}</h2>
            <span className="detail-status-badge" style={{ backgroundColor: policy.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {policy.status}
            </span>
          </div>
          <div className="detail-actions">
            <button className="action-button" onClick={goBack}>Back to Policies</button>
            {canAccess([ROLES.ADMIN]) && (
              <button
                className="action-button button-secondary"
                onClick={() => alert(`Opening inline editing for policy ${policy.policyNumber}`)}
              >
                Edit Policy
              </button>
            )}
          </div>

          <div className="detail-section-grid detail-section-grid-2-col">
            <div className="detail-section">
              <h4 className="detail-section-title">Policy Information</h4>
              <div className="detail-item">
                <span className="detail-label">Policy Type</span>
                <span className="detail-value">{policy.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Policy Holder</span>
                <span className="detail-value">{policyholder?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Holder Email</span>
                <span className="detail-value">{policyholder?.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{policy.status}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">Related Claims</h4>
              {(relatedClaims.length > 0) ? (
                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                  {relatedClaims.map(claim => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      policy={policy}
                      onClick={() => navigate('CLAIM_DETAIL', { claimId: claim.id, claimNumber: claim.claimNumber })}
                    />
                  ))}
                </div>
              ) : (
                <p className="detail-value">No claims associated with this policy.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => {
    if (!canAccess([ROLES.ADMIN])) {
      return (
        <div className="main-content">
          <h2 className="page-title">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
          <button className="action-button" onClick={() => navigate('DASHBOARD')}>Back to Dashboard</button>
        </div>
      );
    }

    const filteredUsers = getFilteredUsers();

    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <button className="action-button" onClick={() => alert('Opening new user form')}>
            + Add New User
          </button>
        </div>
        <div className="flex-row gap-md mb-lg align-center">
          <input
            type="text"
            className="form-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '300px' }}
          />
          <button className="action-button" style={{backgroundColor: 'var(--color-info)'}} onClick={() => alert('Exporting users to Excel/PDF...')}>
              Export
            </button>
        </div>
        {(filteredUsers.length > 0) ? (
          <div className="card-grid">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => alert(`Viewing details for user ${user.name}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">👤</span>
            <h3 className="empty-state-title">No Users Found</h3>
            <p className="empty-state-description">
              It looks like there are no users matching your criteria.
            </p>
            <button className="action-button" onClick={() => alert('Opening new user form')}>
                Add New User
              </button>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>
        <div className="detail-view">
          <h3 className="detail-section-title">User Preferences</h3>
          <div className="detail-item">
            <span className="detail-label">Current Role:</span>
            <span className="detail-value">{currentUserRole}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Change Role (Demo Only):</span>
            <select
              className="form-select"
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value)}
              style={{ width: '200px', marginTop: 'var(--spacing-sm)' }}
            >
              {Object.values(ROLES).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-info)' }}>
            Note: Role changes affect visible navigation and actions. For demo purposes, this is client-side.
          </p>
          <h3 className="detail-section-title" style={{ marginTop: 'var(--spacing-xl)' }}>
            Personalization
          </h3>
          <p>Customize your dashboard layout, default filters, and notification preferences.</p>
          <button className="action-button" style={{ marginTop: 'var(--spacing-md)' }} onClick={() => alert('Saved personalized settings.')}>
            Save Preferences
          </button>
        </div>
      </div>
    );
  };


  const renderContent = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return renderDashboard();
      case 'CLAIM_LIST':
        return renderClaimList();
      case 'CLAIM_DETAIL':
        return renderClaimDetail();
      case 'CLAIM_FORM':
        return renderClaimForm();
      case 'POLICY_LIST':
        return renderPolicyList();
      case 'POLICY_DETAIL':
        return renderPolicyDetail();
      case 'USER_MANAGEMENT':
        return renderUserManagement();
      case 'SETTINGS':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <a href="#" className="header-logo" onClick={() => navigate('DASHBOARD')}>InsurApp</a>
          <nav className="header-nav">
            <a href="#" className="header-nav-item" onClick={() => navigate('DASHBOARD')}>Dashboard</a>
            <a href="#" className="header-nav-item" onClick={() => navigate('CLAIM_LIST')}>Claims</a>
            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
              <a href="#" className="header-nav-item" onClick={() => navigate('POLICY_LIST')}>Policies</a>
            )}
            {canAccess([ROLES.ADMIN]) && (
              <a href="#" className="header-nav-item" onClick={() => navigate('USER_MANAGEMENT')}>Users</a>
            )}
          </nav>
        </div>
        <div className="header-center">
          <input
            type="text"
            className="search-input"
            placeholder="Global search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="header-right">
          <span className="user-badge">Role: {currentUserRole}</span>
          <button className="logout-button" onClick={() => navigate('SETTINGS')}>Settings</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="breadcrumbs">
        {getBreadcrumbs().map((crumb, index, arr) => (
          <React.Fragment key={crumb.label}>
            <a
              href="#"
              className="breadcrumb-link"
              onClick={() => crumb.screen !== view.screen && navigate(crumb.screen, crumb.params)}
            >
              {crumb.label}
            </a>
            {(index < (arr.length - 1)) && (
              <span className="breadcrumb-separator">/</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

// --- Reusable Card Components ---

const ClaimCard = ({ claim, policy, onClick }) => {
  const statusInfo = STATUS_MAPPING[claim.status] || STATUS_MAPPING.DRAFT;
  return (
    <div
      className={`card status-${claim.status.toLowerCase()}`}
      onClick={onClick}
      style={{
        marginBottom: 'var(--spacing-md)'
      }}
    >
      <h3 className="card-title">{claim.claimNumber}</h3>
      <p className="card-meta">
        Policy: {policy?.policyNumber || 'N/A'} | Type: {claim.type}
      </p>
      <p className="card-description">{claim.description?.substring(0, 80)}...</p>
      <div className="card-footer">
        <span className="card-status" style={{ backgroundColor: statusInfo.color }}>
          {statusInfo.label}
        </span>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
          Updated: {claim.lastUpdated}
        </span>
      </div>
    </div>
  );
};

const PolicyCard = ({ policy, policyholder, onClick }) => {
  return (
    <div
      className={`card status-${policy.status === 'ACTIVE' ? 'approved' : 'rejected'}`}
      onClick={onClick}
      style={{
        marginBottom: 'var(--spacing-md)'
      }}
    >
      <h3 className="card-title">{policy.policyNumber}</h3>
      <p className="card-meta">
        Type: {policy.type} | Holder: {policyholder?.name || 'N/A'}
      </p>
      <p className="card-description">Coverage for {policy.type} issued to {policyholder?.name || 'N/A'}.</p>
      <div className="card-footer">
        <span className="card-status" style={{ backgroundColor: policy.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {policy.status}
        </span>
      </div>
    </div>
  );
};

const UserCard = ({ user, onClick }) => {
  return (
    <div
      className={`card status-approved`} // Generic status for user cards
      onClick={onClick}
      style={{
        marginBottom: 'var(--spacing-md)'
      }}
    >
      <h3 className="card-title">{user.name}</h3>
      <p className="card-meta">
        Email: {user.email}
      </p>
      <p className="card-description">Role: {user.role}</p>
      <div className="card-footer">
        <span className="card-status" style={{ backgroundColor: 'var(--color-primary)' }}>
          {user.role}
        </span>
      </div>
    </div>
  );
};


export default App;