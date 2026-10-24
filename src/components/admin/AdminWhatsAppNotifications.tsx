import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Settings,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';

export const AdminWhatsAppNotifications: React.FC = () => {
  const { notifications, settings, updateSettings, sendCustomNotification, orders } = useStore();

  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'test' | 'config'>('logs');
  const [testPhone, setTestPhone] = useState(settings.adminWhatsAppNumber);
  const [testMessage, setTestMessage] = useState(
    'NEW PHOTO FRAME ORDER\n\nOrder ID: PFS-2026-00001\nCustomer: Rohit Sharma\nMobile: +91 98234 56789\nProduct: Artisan Teakwood Heritage Frame\nSize: 12x18 inch\nTotal: ₹3,158\nPayment: Paid (UPI)\n\nPlease log in to the Admin Dashboard to view full order details.'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Studio owner phone config
  const [ownerPhone, setOwnerPhone] = useState(settings.adminWhatsAppNumber);

  const waNotifications = notifications.filter((n) => n.type === 'whatsapp');

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    sendCustomNotification('whatsapp', testPhone, 'Manual WhatsApp Dispatch', testMessage);
    setToastMsg(`WhatsApp message successfully dispatched to ${testPhone}!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ adminWhatsAppNumber: ownerPhone });
    setToastMsg('WhatsApp Business recipient configuration updated!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-slate-900">
            WhatsApp Business Automation & Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time webhook triggers for new orders, payment confirmations, and customer updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Meta Cloud API Connected</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Audit Logs ({waNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-2 border-b-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Message Templates
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`py-2 border-b-2 cursor-pointer ${
            activeTab === 'test'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Dispatch Custom Message
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`py-2 border-b-2 cursor-pointer ${
            activeTab === 'config'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          API & Phone Settings
        </button>
      </div>

      {/* TAB 1: Delivery Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Official Dispatched Messages</span>
            <span className="text-slate-400">Total dispatches: {waNotifications.length}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {waNotifications.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.title}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                      {log.triggerEvent}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono-numbers text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <p className="font-mono text-slate-600 text-[11px] whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex-1">
                    {log.message}
                  </p>
                  <div className="flex flex-col gap-1.5 shrink-0 text-right">
                    <span className="text-[11px] font-semibold text-slate-700">
                      To: {log.recipient}
                    </span>
                    <button
                      onClick={() => copyToClipboard(log.message, log.id)}
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 justify-end cursor-pointer"
                    >
                      {copiedId === log.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === log.id ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Templates Preview */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Template 1</span>
            <h4 className="font-bold text-slate-900">New Order Placed (Studio Owner Alert)</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-700">
              {`NEW PHOTO FRAME ORDER

Order ID: {{orderNumber}}
Customer: {{customerName}}
Mobile: {{customerPhone}}
Product: {{productName}}
Size: {{frameSize}}
Quantity: {{quantity}}
Order Total: ₹{{total}}
Advance Paid: ₹{{advance}}
Balance Due: ₹{{balance}}
Payment Status: {{paymentStatus}}
Order Status: Pending Review

Please log in to the Admin Dashboard to view full order details.`}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Template 2</span>
            <h4 className="font-bold text-slate-900">Customer Production Status Update</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-700">
              {`Hello {{customerName}},

Your custom photo frame order {{orderNumber}} is now: *{{status}}*.
Our workshop artisans are completing the mitring and preservation mounting.

Estimated completion: {{deliveryDate}}.
Agifthub Picture Frame Studio`}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Template 3</span>
            <h4 className="font-bold text-slate-900">Payment Received & Verified</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-700">
              {`PAYMENT RECEIVED

Order ID: {{orderNumber}}
Amount Received: ₹{{amount}}
Method: {{method}}
Ref: {{transactionRef}}
Remaining Balance: ₹{{balanceDue}}

Your official cash memo has been generated.`}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Template 4</span>
            <h4 className="font-bold text-slate-900">Order Rejection / Resolution Required</h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-700">
              {`Dear {{customerName}},

We could not process order {{orderNumber}}.
Reason: {{reason}}.
Please contact the studio or reply with a higher resolution image.`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dispatch Custom Message */}
      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-xl text-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Send Direct WhatsApp Message</h3>
            <p className="text-slate-500 mt-0.5">
              Directly dispatch a test notification or custom note to any mobile number.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 8404049497"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
              <textarea
                rows={6}
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch via WhatsApp Cloud API</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: API & Phone Settings */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-xl text-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">WhatsApp Studio Configuration</h3>
            <p className="text-slate-500 mt-0.5">
              Configure the studio owner phone number that receives automatic new order alerts.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Studio Owner Alert Number
              </label>
              <input
                type="text"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono-numbers"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                All order placements and cancellations automatically dispatch notifications here.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.enableWhatsAppAutomation}
                  onChange={(e) =>
                    updateSettings({ enableWhatsAppAutomation: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Enable Automated WhatsApp Alerts for Every New Order</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.enableEmailAutomation}
                  onChange={(e) => updateSettings({ enableEmailAutomation: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Enable Automated Customer Email Invoices</span>
              </label>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
