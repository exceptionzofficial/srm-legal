
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiFileText, FiExternalLink, FiChevronDown, FiChevronUp, FiCamera, FiCreditCard, FiFile, FiBookOpen, FiHome, FiMapPin, FiUpload, FiCheck, FiLoader } from 'react-icons/fi';
import { getEmployees, getBranches, updateEmployee } from '../services/api';

const DOCUMENT_LABELS = {
    photoUrl: { label: 'Photo', Icon: FiCamera, field: 'photo' },
    aadharUrl: { label: 'Aadhar Card', Icon: FiCreditCard, field: 'doc_aadhar' },
    panUrl: { label: 'PAN Card', Icon: FiCreditCard, field: 'doc_pan' },
    marksheetUrl: { label: 'Marksheet', Icon: FiBookOpen, field: 'doc_marksheet' },
    licenseUrl: { label: 'License', Icon: FiFile, field: 'doc_license' },
};

const Documents = () => {
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [uploading, setUploading] = useState({});
    const [uploadSuccess, setUploadSuccess] = useState({});
    const fileInputRefs = useRef({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empData, branchData] = await Promise.all([
                getEmployees(),
                getBranches()
            ]);
            setEmployees(empData.employees || []);
            setBranches(branchData.branches || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBranchName = (branchId) => {
        if (!branchId) return 'Unassigned';
        const branch = branches.find(b => b.branchId === branchId);
        return branch ? branch.name : branchId;
    };

    const getDocumentCount = (emp) => {
        const docs = emp.documents || {};
        return Object.keys(DOCUMENT_LABELS).filter(key => docs[key]).length;
    };

    const handleUpload = async (employeeId, docKey, fieldName, file) => {
        const uploadKey = `${employeeId}_${docKey}`;
        setUploading(prev => ({ ...prev, [uploadKey]: true }));
        setUploadSuccess(prev => ({ ...prev, [uploadKey]: false }));

        try {
            const formData = new FormData();
            formData.append(fieldName, file);

            await updateEmployee(employeeId, formData);

            // Refresh data to show updated document
            const empData = await getEmployees();
            setEmployees(empData.employees || []);

            setUploadSuccess(prev => ({ ...prev, [uploadKey]: true }));
            setTimeout(() => {
                setUploadSuccess(prev => ({ ...prev, [uploadKey]: false }));
            }, 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            const errMsg = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Upload failed: ${errMsg}`);
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    const triggerFileInput = (employeeId, docKey) => {
        const refKey = `${employeeId}_${docKey}`;
        if (fileInputRefs.current[refKey]) {
            fileInputRefs.current[refKey].click();
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by branch
    const employeesByBranch = filteredEmployees.reduce((acc, emp) => {
        const branchId = emp.branchId || 'Unassigned';
        const branchName = getBranchName(branchId);
        if (!acc[branchName]) acc[branchName] = [];
        acc[branchName].push(emp);
        return acc;
    }, {});

    const toggleExpand = (employeeId) => {
        setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ padding: '0' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Employee Documents</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        View, upload, and manage documents for employees
                    </p>
                </div>

                {/* Search */}
                <div style={{ background: 'white', padding: '8px 12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', width: '300px', borderRadius: '4px' }}>
                    <FiSearch style={{ marginRight: '8px', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by Name or ID..."
                        style={{ border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Employees</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{employees.length}</span>
                </div>
                <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>With Documents</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: '#15803d' }}>
                        {employees.filter(e => getDocumentCount(e) > 0).length}
                    </span>
                </div>
                <div className="stat-card" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Missing Documents</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--danger)' }}>
                        {employees.filter(e => getDocumentCount(e) === 0).length}
                    </span>
                </div>
            </div>

            {/* Employees by Branch */}
            {Object.keys(employeesByBranch).length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No employees found.</p>
                </div>
            ) : (
                Object.entries(employeesByBranch).map(([branchName, branchEmployees]) => (
                    <div key={branchName} style={{ marginBottom: '24px' }}>
                        {/* Branch Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '10px 16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiHome size={16} /> {branchName}
                            </span>
                            <span style={{ background: '#bfdbfe', color: '#1e40af', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                                {branchEmployees.length} {branchEmployees.length === 1 ? 'employee' : 'employees'}
                            </span>
                        </div>

                        {/* Employee Table */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>#</th>
                                            <th>Employee Name</th>
                                            <th>Employee ID</th>
                                            <th>Designation</th>
                                            <th style={{ textAlign: 'center' }}>Documents</th>
                                            <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branchEmployees.map((emp, idx) => {
                                            const docCount = getDocumentCount(emp);
                                            const totalDocs = Object.keys(DOCUMENT_LABELS).length;
                                            const isExpanded = expandedEmployee === emp.employeeId;

                                            return (
                                                <>
                                                    <tr key={emp.employeeId} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(emp.employeeId)}>
                                                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{idx + 1}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                {emp.documents?.photoUrl ? (
                                                                    <img
                                                                        src={emp.documents.photoUrl}
                                                                        alt={emp.name}
                                                                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                                                                    />
                                                                ) : (
                                                                    <div style={{ background: 'rgba(239, 65, 54, 0.08)', padding: '8px', borderRadius: '50%', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <FiUser size={16} />
                                                                    </div>
                                                                )}
                                                                <span style={{ fontWeight: 600 }}>{emp.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ fontFamily: 'monospace', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e5e7eb', fontSize: '12px' }}>
                                                                {emp.employeeId}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{emp.designation || 'Staff'}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '4px 12px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                background: docCount === totalDocs ? '#dcfce7' : docCount > 0 ? '#fef9c3' : '#fee2e2',
                                                                color: docCount === totalDocs ? '#15803d' : docCount > 0 ? '#854d0e' : '#991b1b'
                                                            }}>
                                                                {docCount}/{totalDocs} uploaded
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                                                onClick={(e) => { e.stopPropagation(); toggleExpand(emp.employeeId); }}
                                                            >
                                                                {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                                                {isExpanded ? ' Hide' : ' View'}
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Document Details with Upload */}
                                                    {isExpanded && (
                                                        <tr key={`${emp.employeeId}-docs`}>
                                                            <td colSpan={6} style={{ padding: 0, background: '#f8fafc' }}>
                                                                <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                                                    {Object.entries(DOCUMENT_LABELS).map(([key, { label, Icon, field }]) => {
                                                                        const url = emp.documents?.[key];
                                                                        const uploadKey = `${emp.employeeId}_${key}`;
                                                                        const isUploading = uploading[uploadKey];
                                                                        const isSuccess = uploadSuccess[uploadKey];

                                                                        return (
                                                                            <div
                                                                                key={key}
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '12px',
                                                                                    padding: '12px 16px',
                                                                                    borderRadius: '8px',
                                                                                    background: url ? 'white' : '#fef2f2',
                                                                                    border: url ? '1px solid #e5e7eb' : '1px solid #fecaca',
                                                                                    transition: 'all 0.2s'
                                                                                }}
                                                                            >
                                                                                <div style={{ color: url ? '#1e40af' : '#991b1b', display: 'flex', alignItems: 'center' }}><Icon size={20} /></div>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{label}</div>
                                                                                    <div style={{ fontSize: '11px', color: url ? '#15803d' : '#991b1b', fontWeight: 500 }}>
                                                                                        {url ? '✓ Uploaded' : '✗ Not uploaded'}
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    {url && (
                                                                                        <a
                                                                                            href={url}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            style={{
                                                                                                color: 'var(--primary)',
                                                                                                padding: '6px',
                                                                                                borderRadius: '4px',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                background: 'rgba(239, 65, 54, 0.06)'
                                                                                            }}
                                                                                            title="Open document"
                                                                                        >
                                                                                            <FiExternalLink size={16} />
                                                                                        </a>
                                                                                    )}
                                                                                    {/* Upload / Re-upload */}
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*,.pdf"
                                                                                        style={{ display: 'none' }}
                                                                                        ref={el => fileInputRefs.current[uploadKey] = el}
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files[0]) {
                                                                                                handleUpload(emp.employeeId, key, field, e.target.files[0]);
                                                                                            }
                                                                                            e.target.value = '';
                                                                                        }}
                                                                                    />
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            if (!isUploading) triggerFileInput(emp.employeeId, key);
                                                                                        }}
                                                                                        disabled={isUploading}
                                                                                        title={url ? 'Re-upload' : 'Upload'}
                                                                                        style={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '4px',
                                                                                            padding: '5px 10px',
                                                                                            borderRadius: '6px',
                                                                                            border: isSuccess ? '1px solid #86efac' : isUploading ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                                                                                            background: isSuccess ? '#dcfce7' : isUploading ? '#eff6ff' : 'white',
                                                                                            color: isSuccess ? '#15803d' : isUploading ? '#1e40af' : '#6b7280',
                                                                                            fontSize: '12px',
                                                                                            fontWeight: 500,
                                                                                            cursor: isUploading ? 'not-allowed' : 'pointer',
                                                                                            transition: 'all 0.2s',
                                                                                            whiteSpace: 'nowrap'
                                                                                        }}
                                                                                    >
                                                                                        {isUploading ? (
                                                                                            <FiLoader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                                                                        ) : isSuccess ? (
                                                                                            <FiCheck size={14} />
                                                                                        ) : (
                                                                                            <FiUpload size={14} />
                                                                                        )}
                                                                                        <span>{isUploading ? 'Uploading...' : isSuccess ? 'Done!' : (url ? 'Re-upload' : 'Upload')}</span>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Inline keyframes for spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Documents;
