'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, Clock, Receipt, DollarSign, RefreshCw } from 'lucide-react';

interface Payment {
  id: string;
  transactionId?: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  reservation?: {
    id: string;
    depositAmount?: number;
    customer?: { fullName: string; email: string };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch {
      console.warn('Could not load payments from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await api.patch(`/payments/${paymentId}/status`, { status: 'PAID' });
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <CheckCircle className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
            <RefreshCw className="w-3.5 h-3.5" /> REFUNDED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">Checkout & Payment Invoices</h2>
        <p className="text-xs text-gray-500">Track rental fees, paid security deposits, and settlement status</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading payment records...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
          <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          No payment records found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Rental Fee</th>
                <th className="p-4">Deposit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => {
                const customer = p.reservation?.customer;
                const deposit = p.reservation?.depositAmount ?? 0;
                const txnCode = p.transactionId || `TXN-${p.id.slice(0, 8)}`;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-xs font-semibold text-gray-800">{txnCode}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{customer?.fullName || 'Customer'}</div>
                      <div className="text-xs text-gray-400">{customer?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-900">${Number(p.amount || 0).toFixed(2)}</td>
                    <td className="p-4 font-semibold text-blue-600">${Number(deposit).toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(p.status)}</td>
                    <td className="p-4 text-right">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Process Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}