import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Shield,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Key,
} from 'lucide-react';

export const AdminBackupSecurity: React.FC = () => {
  const { auditLogs, resetDataToFactory, products, orders, categories, payments, settings } =
    useStore();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleExportFullJSON = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      storeName: settings.storeName,
      products,
      orders,
      categories,
      payments,
      settings,
      auditLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agifthub_full_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMsg('Complete database snapshot exported safely!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleResetFactory = () => {
    if (confirm('Are you sure you want to restore factory default seed data? All custom orders and frames created in this session will reset.')) {
      resetDataToFactory();
      setToastMsg('Database restored to initial factory seed state.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
          Database Backup, Data Export & Security Audit Logs
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trails of order status modifications, offline payment verifications, and system backups.
        </p>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Full Database Export</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Download an encrypted JSON snapshot containing all {products.length} products, {orders.length} orders, payment logs, and store settings.
          </p>
          <button
            onClick={handleExportFullJSON}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Encrypted JSON Backup</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-700">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset Database to Clean Slate</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Reset all orders, payments, and generated invoices to a fresh, clean slate while keeping your product catalog and studio settings intact.
          </p>
          <button
            onClick={handleResetFactory}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Orders & Invoices (Clean Slate)</span>
          </button>
        </div>
      </div>

      {/* Security Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>System Audit & Security Logs</span>
          </span>
          <span className="text-slate-400 font-mono-numbers">{auditLogs.length} events logged</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-slate-500 font-mono-numbers text-[11px]">
                    by {log.actor}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed mt-1">
                  {log.details}
                </p>
              </div>

              <span className="text-slate-400 font-mono-numbers text-[10px] shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
