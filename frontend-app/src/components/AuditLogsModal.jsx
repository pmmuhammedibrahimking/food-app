import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { exportToCSV, printPDFReport } from '../utils/reportExporter';
import { IconX, IconSearch, IconClock, IconPrinter, IconSparkles, IconCrown } from './Icons';

export const AuditLogsModal = ({ isOpen, onClose }) => {
  const { auditLogs: contextAuditLogs, currentUser } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'General Manager' ||
    currentUser?.role === 'Manager' ||
    currentUser?.role === 'System Admin';

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || json);
      } else {
        setLogs(contextAuditLogs);
      }
    } catch (e) {
      setLogs(contextAuditLogs);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = (logs.length > 0 ? logs : contextAuditLogs).filter((log) => {
    const matchesSearch =
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.module || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.relevantRecordId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'All' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    exportToCSV(
      'Aurelia_System_Audit_Logs',
      filteredLogs.map((l) => ({
        ID: l.id || l._id,
        Timestamp: new Date(l.timestamp).toLocaleString(),
        User: l.user,
        Role: l.role || 'Staff',
        Action: l.action,
        Module: l.module || 'System',
        RecordID: l.relevantRecordId || 'N/A',
        Details: l.details
      }))
    );
  };

  const handlePrintPDF = () => {
    printPDFReport(
      'Aurelia Resort System Operations Audit Log Report',
      [
        { label: 'Total Recorded Logs', value: filteredLogs.length },
        { label: 'Audited Module', value: filterAction },
        { label: 'Audited By', value: currentUser?.name || 'General Manager' }
      ],
      filteredLogs.map((l) => ({
        Time: new Date(l.timestamp).toLocaleTimeString(),
        User: `${l.user} (${l.role || 'Staff'})`,
        Action: l.action,
        Module: l.module || 'System',
        Record: l.relevantRecordId || 'N/A',
        Details: l.details
      }))
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <IconClock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  System Operations Audit Trail
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live MongoDB Trail
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Security compliance, staff mutations & real-time operational event monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 transition-all hidden sm:inline-block"
            >
              Export CSV
            </button>
            <button
              onClick={handlePrintPDF}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <IconPrinter size={14} /> Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Search & Action Filters */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-full sm:w-80">
            <IconSearch size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by user, action, record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-slate-100 focus:outline-none text-xs w-full placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto self-stretch sm:self-auto pb-1 sm:pb-0 no-scrollbar">
            {['All', 'Login', 'Logout', 'Check-in', 'Check-out', 'Payment update', 'Reservation created', 'Room created'].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                  filterAction === act
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
              Streaming audit records...
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Staff / User</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No matching audit records found for "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={log.id || log._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{log.user || 'System'}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{log.role || 'Admin'}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            log.action?.includes('Check-in') || log.action?.includes('created')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : log.action?.includes('Payment')
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : log.action?.includes('Login')
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : log.action?.includes('cancelled')
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-medium whitespace-nowrap">{log.module || 'System'}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">{log.relevantRecordId || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-slate-300 leading-snug">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
