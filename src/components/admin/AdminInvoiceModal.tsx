import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, CashMemo } from '../../types';
import {
  X,
  Printer,
  Download,
  QrCode,
  CheckCircle,
  FileText,
  Building,
  Phone,
  Mail,
  Receipt,
  Copy,
  Check,
  Loader2,
  FileDown,
} from 'lucide-react';
import { generateQRCodeSVG, buildUpiUri } from '../../utils/qrGenerator';
import { downloadInvoiceAsPDF } from '../../utils/pdfGenerator';

interface AdminInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({ order, onClose }) => {
  const { settings, getCashMemoForOrder, generateFinalCashMemo } = useStore();
  const [printFormat, setPrintFormat] = useState<'58mm' | '80mm' | 'a4'>('a4');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Retrieve or generate cash memo for this order
  const cashMemo = getCashMemoForOrder(order.id) || generateFinalCashMemo(order.id);

  const isDeliveredAndPaid = order.productionStatus === 'Delivered' && order.paymentStatus === 'Paid';

  // UPI payment QR code SVG
  const upiUri = buildUpiUri({
    upiId: settings.upiId,
    storeName: settings.storeName,
    amount: order.balanceDue > 0 ? order.balanceDue : undefined,
    orderNumber: order.orderNumber,
  });
  const upiQrSvg = generateQRCodeSVG(upiUri, printFormat === '58mm' ? 100 : 130);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async (forceFormat?: 'a4' | '80mm' | '58mm') => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const targetFormat = forceFormat || printFormat;
      const success = await downloadInvoiceAsPDF({
        elementId: 'printable-receipt',
        format: targetFormat,
        order,
        settings,
        cashMemo,
        filename: `${cashMemo?.invoiceNumber || order.orderNumber}_Invoice_${targetFormat.toUpperCase()}.pdf`,
      });

      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyInvoiceNumber = () => {
    if (cashMemo?.invoiceNumber) {
      navigator.clipboard.writeText(cashMemo.invoiceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 relative flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during window.print()) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm font-serif-luxury">
                Official Cash Memo & Invoice Generator
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-numbers">
                Order {order.orderNumber} · {isDeliveredAndPaid ? 'Final Verified Cash Memo' : 'Preliminary Order Invoice'}
              </p>
            </div>
          </div>

          {/* Format selector & actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  printFormat === 'a4' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 Invoice
              </button>
              <button
                onClick={() => setPrintFormat('80mm')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  printFormat === '80mm' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
              <button
                onClick={() => setPrintFormat('58mm')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  printFormat === '58mm' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                58mm Thermal
              </button>
            </div>

            {/* Direct PDF File Download Button */}
            <button
              onClick={() => handleDownloadPDF()}
              disabled={isDownloading}
              className={`px-3.5 py-1.5 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                downloadSuccess
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              } disabled:opacity-70 disabled:cursor-wait`}
              title="Download official PDF file to your device"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Physical Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Print directly or save via browser print"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Invoice Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Sub-Bar with Quick A4 PDF Option if thermal is selected */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-300 no-print gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Generating <strong>{printFormat === 'a4' ? 'Formal A4 Tax Invoice' : `${printFormat} POS Thermal Slip`}</strong> for {order.customerName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {cashMemo?.invoiceNumber && (
              <button
                onClick={handleCopyInvoiceNumber}
                className="hover:text-white flex items-center gap-1 cursor-pointer font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{cashMemo.invoiceNumber}</span>
              </button>
            )}

            {printFormat !== 'a4' && (
              <button
                onClick={() => {
                  setPrintFormat('a4');
                  setTimeout(() => handleDownloadPDF('a4'), 150);
                }}
                disabled={isDownloading}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download as A4 PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Invoice Container Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          {/* Printable Element with Target ID for @media print */}
          <div
            id="printable-receipt"
            className={`bg-white shadow-xl text-slate-900 border border-slate-200 transition-all ${
              printFormat === '58mm'
                ? 'receipt-58mm font-mono-numbers'
                : printFormat === '80mm'
                ? 'receipt-80mm font-mono-numbers'
                : 'invoice-a4 rounded-xl'
            }`}
          >
            {/* 58mm / 80mm THERMAL RECEIPT LAYOUT */}
            {(printFormat === '58mm' || printFormat === '80mm') && (
              <div className="space-y-2 text-center">
                {/* Header */}
                <div className="border-b border-dashed border-slate-400 pb-2">
                  <p className="font-bold text-sm uppercase tracking-wider">{settings.storeName}</p>
                  <p className="text-[10px] text-slate-600">{settings.address}</p>
                  <p className="text-[10px] text-slate-600">Tel: {settings.phone}</p>
                  <p className="text-[10px] text-slate-600 font-mono">GSTIN: 07AAACA1234F1Z9</p>
                </div>

                {/* Memo Meta */}
                <div className="text-left text-[11px] py-1 border-b border-dashed border-slate-400 space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>MEMO NO:</span>
                    <span>{cashMemo?.invoiceNumber || 'PFS-INV-2026-0001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ORDER ID:</span>
                    <span>{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CUSTOMER:</span>
                    <span className="font-semibold">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MOBILE:</span>
                    <span>{order.customerPhone}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 pt-0.5 line-clamp-1">
                    ADDR: {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-1 border-b border-dashed border-slate-400 text-left">
                  <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-1 mb-1">
                    <span>ITEM / SIZE</span>
                    <span>QTY x RATE = AMT</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-0.5">
                      <p className="font-bold text-[10px] leading-tight line-clamp-1">{item.name}</p>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>{item.size}</span>
                        <span>
                          {item.quantity} x {item.price} = ₹{item.finalPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-1 border-b border-dashed border-slate-400 text-right text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>DISCOUNT:</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>SHIPPING:</span>
                    <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({settings.taxRate}%):</span>
                    <span>₹{order.taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                    <span>FINAL TOTAL:</span>
                    <span>₹{order.orderTotal}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[11px] text-emerald-800">
                    <span>AMOUNT PAID:</span>
                    <span>₹{order.advancePaid}</span>
                  </div>
                  {order.balanceDue > 0 ? (
                    <div className="flex justify-between font-bold text-[11px] text-rose-700">
                      <span>BALANCE DUE:</span>
                      <span>₹{order.balanceDue}</span>
                    </div>
                  ) : (
                    <div className="text-center font-bold text-[11px] text-emerald-800 pt-1">
                      *** PAYMENT FULLY RECEIVED ***
                    </div>
                  )}
                </div>

                {/* UPI QR Code Requirement */}
                <div className="py-2 flex flex-col items-center justify-center space-y-1">
                  <div
                    className="p-1 border border-slate-300 bg-white"
                    dangerouslySetInnerHTML={{ __html: upiQrSvg }}
                  />
                  <p className="text-[10px] font-bold">
                    {order.balanceDue > 0 ? 'SCAN TO PAY BALANCE' : 'OFFICIAL PAYMENT QR'}
                  </p>
                  <p className="text-[9px] text-slate-600 font-mono">UPI ID: {settings.upiId}</p>
                  <p className="text-[8px] text-slate-500">Agifthub Picture Frame Studio</p>
                </div>

                {/* Footer notes */}
                <div className="pt-1 text-[9px] text-slate-500 leading-tight">
                  <p>Handcrafted solid wood frames.</p>
                  <p>Thank you for choosing Agifthub!</p>
                  <p className="mt-1 font-mono text-[8px] text-slate-400">
                    STATUS: {order.productionStatus.toUpperCase()} · {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            {/* A4 FORMAL BUSINESS INVOICE LAYOUT */}
            {printFormat === 'a4' && (
              <div className="space-y-6 text-xs">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded bg-emerald-800 text-white flex items-center justify-center font-serif-luxury font-bold text-lg">
                        A
                      </div>
                      <h1 className="text-2xl font-serif-luxury font-bold text-slate-900">
                        {settings.storeName}
                      </h1>
                    </div>
                    <p className="text-slate-600 max-w-sm">{settings.address}</p>
                    <p className="text-slate-600 mt-1 font-mono-numbers">
                      Phone: {settings.phone} · Email: {settings.email}
                    </p>
                    <p className="text-slate-600 font-mono">GSTIN: 07AAACA1234F1Z9 · MSME Reg: UDYAM-DL-03-00123</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm tracking-wider uppercase rounded-xs">
                      {isDeliveredAndPaid ? 'FINAL CASH MEMO' : 'TAX INVOICE'}
                    </span>
                    <p className="font-mono-numbers font-bold text-sm text-slate-900 mt-2">
                      {cashMemo?.invoiceNumber || 'PFS-INV-2026-0001'}
                    </p>
                    <p className="text-slate-500 font-mono-numbers text-[11px]">
                      Date: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                    <p className="text-slate-500 font-mono-numbers text-[11px]">
                      Order Ref: {order.orderNumber}
                    </p>
                  </div>
                </div>

                {/* Customer and Delivery Details */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                      Billed & Delivered To:
                    </p>
                    <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
                    <p className="text-slate-600 mt-0.5">{order.shippingAddress.street}</p>
                    <p className="text-slate-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-slate-600 font-mono-numbers mt-1">Phone: {order.customerPhone}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                      Order Fulfillment Status:
                    </p>
                    <p className="text-slate-700">
                      Production: <strong>{order.productionStatus}</strong>
                    </p>
                    <p className="text-slate-700">
                      Payment Status: <strong>{order.paymentStatus}</strong>
                    </p>
                    <p className="text-slate-700">
                      Delivery Date: <strong>{order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : 'In Transit'}</strong>
                    </p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Description / Moulding</th>
                        <th className="py-2.5 px-3">Size / Specs</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono-numbers">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">
                            {item.name}
                            {item.customText && (
                              <p className="text-[10px] text-emerald-800 italic font-sans font-normal mt-0.5">
                                Engraved: "{item.customText}"
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-sans">
                            {item.size} · {item.color}
                          </td>
                          <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right">₹{item.price.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            ₹{item.finalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Section: QR Code & Financial Totals */}
                <div className="grid grid-cols-2 gap-6 pt-2 items-start">
                  {/* Left: UPI QR Code & Payment Verification */}
                  <div className="border border-slate-200 p-4 rounded-lg flex items-center gap-4 bg-slate-50/60">
                    <div
                      className="p-1 border border-slate-300 bg-white rounded shrink-0"
                      dangerouslySetInnerHTML={{ __html: upiQrSvg }}
                    />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <span>Official Store UPI QR</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-700">UPI ID: {settings.upiId}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {order.balanceDue > 0
                          ? `Scan with any UPI app to settle remaining balance of ₹${order.balanceDue.toLocaleString()}`
                          : 'Payment received in full. Thank you for framing with Agifthub!'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="space-y-1.5 font-mono-numbers text-slate-700">
                    <div className="flex justify-between">
                      <span className="font-sans">Subtotal:</span>
                      <span>₹{order.subtotal.toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span className="font-sans">Discount:</span>
                        <span>-₹{order.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-sans">Safe-Transit Shipping:</span>
                      <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">GST ({settings.taxRate}%):</span>
                      <span>₹{order.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-300">
                      <span className="font-sans">Final Order Total:</span>
                      <span className="text-emerald-800">₹{order.orderTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-emerald-700">
                      <span className="font-sans">Amount Received ({order.paymentStatus}):</span>
                      <span>₹{order.advancePaid.toLocaleString()}</span>
                    </div>
                    {order.balanceDue > 0 && (
                      <div className="flex justify-between font-bold text-xs text-rose-700">
                        <span className="font-sans">Remaining Balance Due:</span>
                        <span>₹{order.balanceDue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signatory & Legal Terms */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                  <div>
                    <p className="font-bold text-slate-700">Terms & Conditions:</p>
                    <p>1. Handcrafted wooden mouldings possess natural timber grain variations.</p>
                    <p>2. Keep frames away from direct damp walls and extreme rain humidity.</p>
                    <p>3. This is an authorized digital tax invoice generated by Agifthub Picture Frame Studio.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-32 h-10 border-b border-slate-300 mx-auto flex items-end justify-center pb-1">
                      <span className="font-serif-luxury italic text-xs text-slate-700">Expert Aftab Tech</span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">Authorized Signatory</p>
                    <p>Agifthub Studio, New Delhi</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
