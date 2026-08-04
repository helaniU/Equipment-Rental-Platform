'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle2, XCircle, Clock, Plus, CreditCard, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ReservationItem {
  id: string;
  quantity: number;
  equipment: { name: string; id?: string; stockQuantity?: number; quantity?: number };
}

interface Reservation {
  id: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUNDED';
  rejectionReason?: string;
  items?: ReservationItem[];
  customer?: { fullName?: string; name?: string; email?: string };
  user?: { fullName?: string; name?: string; email?: string };
  isPaid?: boolean;
  paymentStatus?: string;
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    quantity: 1,
    pickupDate: '',
    returnDate: '',
  });

  // Custom Payment Message Box Modal State
  const [selectedPaymentReservation, setSelectedPaymentReservation] = useState<Reservation | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Custom Confirmation Modal State for Cancellation / Refund Request
  const [cancelReservationTarget, setCancelReservationTarget] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Rejection Reason Modal State
  const [rejectReservationId, setRejectReservationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const roleName = typeof user?.role === 'object' ? (user?.role as any)?.name : user?.role;
  const isStaffOrAdmin = ['ADMIN', 'STAFF'].includes(roleName || '');

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch {
      console.warn('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipmentList(res.data);
    } catch {
      console.warn('Failed to load equipment list');
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchEquipment();
  }, []);

  const patchReservationLocally = (id: string, patch: Partial<Reservation>) => {
    setReservations((prev) =>
      prev.map((reservation) => (reservation.id === id ? { ...reservation, ...patch } : reservation)),
    );
  };

  const handleStatusChange = async (id: string, status: string) => {
    if (status === 'REJECTED') {
      setRejectReservationId(id);
      setRejectionReason('');
      return;
    }

    try {
      await api.patch(`/reservations/${id}/status`, { status });
      patchReservationLocally(id, { status: status as Reservation['status'] });
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update reservation status');
    }
  };

  const confirmCancelReservation = async () => {
    if (!cancelReservationTarget) return;

    setIsCancelling(true);
    try {
      await api.put(`/reservations/${cancelReservationTarget.id}/cancel`);
      patchReservationLocally(cancelReservationTarget.id, {
        status: cancelReservationTarget.isPaid ? 'REFUND_REQUESTED' : 'CANCELLED',
      });
      setCancelReservationTarget(null);
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmRejection = async () => {
    if (!rejectReservationId || !rejectionReason.trim()) return;

    setIsSubmittingReject(true);
    try {
      await api.patch(`/reservations/${rejectReservationId}/status`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      setRejectReservationId(null);
      setRejectionReason('');
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject reservation');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const confirmPayment = async () => {
    if (!selectedPaymentReservation) return;

    setIsPaying(true);
    try {
      await api.post('/payments/process', {
        reservationId: selectedPaymentReservation.id,
        amount: Number(selectedPaymentReservation.totalPrice),
        type: 'RENTAL_FEE',
        paymentMethod: 'MOCK_CARD'
      });

      patchReservationLocally(selectedPaymentReservation.id, { isPaid: true, paymentStatus: 'PAID' });
      setSelectedPaymentReservation(null);
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        items: [
          {
            equipmentId: formData.equipmentId,
            quantity: Number(formData.quantity),
          },
        ],
      };

      await api.post('/reservations', payload);
      setIsModalOpen(false);
      setFormData({ equipmentId: '', quantity: 1, pickupDate: '', returnDate: '' });
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const getStatusBadge = (res: Reservation) => {
    switch (res.status) {
      case 'APPROVED':
      case 'ACTIVE':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> {res.status}</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> {res.status}</span>;
      case 'REFUND_REQUESTED':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><RefreshCw className="w-3.5 h-3.5" /> REFUND REQUESTED</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> REFUNDED</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <div className="space-y-1">
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
              <XCircle className="w-3.5 h-3.5" /> {res.status}
            </span>
            {res.rejectionReason && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 max-w-xs">
                <span className="font-semibold">Reason:</span> {res.rejectionReason}
              </p>
            )}
          </div>
        );
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full w-fit">{res.status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Booking Management</h2>
          <p className="text-xs text-gray-500">Track and update equipment rental reservations</p>
        </div>
        {!isStaffOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Reservation
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading bookings...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          No reservations found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="p-4">Equipment</th>
                <th className="p-4">Reserved By</th>
                <th className="p-4">Rental Period</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((res) => {
                const equipmentSummary = res.items?.map((i) => {
                  const equipmentName =
                    i.equipment?.name ||
                    equipmentList.find((eq) => eq.id === (i.equipment?.id ?? (i as any).equipmentId ?? (i as any).equipment))?.name ||
                    'Equipment';

                  return `${equipmentName} (x${i.quantity})`;
                }).join(', ') || 'N/A';
                
                const clientObj = res.customer || res.user;
                const clientName = clientObj?.fullName || clientObj?.name || 'Customer';
                const clientEmail = clientObj?.email || '';

                return (
                  <tr key={res.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-gray-900">{equipmentSummary}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{clientName}</div>
                      {clientEmail && <div className="text-xs text-gray-400">{clientEmail}</div>}
                    </td>
                    <td className="p-4 text-xs">
                      {new Date(res.pickupDate).toLocaleDateString()} — {new Date(res.returnDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-blue-600">${res.totalPrice}</td>
                    <td className="p-4">{getStatusBadge(res)}</td>
                    
                    <td className="p-4 text-right space-x-2">
                      {isStaffOrAdmin && res.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(res.id, 'APPROVED')}
                            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(res.id, 'REJECTED')}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isStaffOrAdmin && res.status === 'REFUND_REQUESTED' && (
                        <button
                          onClick={() => handleStatusChange(res.id, 'REFUNDED')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition"
                        >
                          Approve Refund
                        </button>
                      )}

                      {!isStaffOrAdmin && res.status === 'APPROVED' && !res.isPaid && (
                        <button
                          onClick={() => setSelectedPaymentReservation(res)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Now
                        </button>
                      )}

                      {!isStaffOrAdmin && (res.status === 'PENDING' || res.status === 'APPROVED') && res.status !== 'REFUND_REQUESTED' && (
                        <button
                          onClick={() => setCancelReservationTarget(res)}
                          className="px-3 py-1.5 bg-gray-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 border border-gray-200 transition inline-flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          {res.isPaid ? 'Request Refund' : 'Cancel'}
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

      {cancelReservationTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {cancelReservationTarget.isPaid ? 'Request Refund' : 'Cancel Reservation'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {cancelReservationTarget.isPaid
                  ? 'Since this reservation is already paid, submitting will request an administrative refund.'
                  : 'Are you sure you want to cancel this reservation?'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelReservationTarget(null)}
                disabled={isCancelling}
                className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmCancelReservation}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
              >
                {isCancelling ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectReservationId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Reservation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Please state the reason for rejecting this booking request.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection</label>
              <textarea
                required
                rows={3}
                placeholder="e.g., Equipment out of stock, maintenance required..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectReservationId(null)}
                disabled={isSubmittingReject}
                className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejection}
                disabled={isSubmittingReject || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPaymentReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Payment Confirmation</h3>
              <p className="text-xs text-gray-500 mt-1">
                Confirm payment for your equipment reservation
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Equipment:</span>
                <span className="font-semibold text-gray-900">
                  {selectedPaymentReservation.items?.map((i) => {
                    return (
                      i.equipment?.name ||
                      equipmentList.find((eq) => eq.id === (i.equipment?.id ?? (i as any).equipmentId ?? (i as any).equipment))?.name ||
                      'Gear'
                    );
                  }).join(', ') || 'Gear'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium text-gray-900">
                  {selectedPaymentReservation.customer?.fullName || 
                   selectedPaymentReservation.customer?.name || 
                   selectedPaymentReservation.user?.fullName || 
                   selectedPaymentReservation.user?.name || 
                   selectedPaymentReservation.user?.email || 
                   user?.fullName || 
                   user?.email || 
                   'Customer'}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-blue-600">${selectedPaymentReservation.totalPrice}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentReservation(null)}
                disabled={isPaying}
                className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                disabled={isPaying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1"
              >
                {isPaying ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Create New Reservation</h3>
            <form onSubmit={handleCreateReservation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Equipment</label>
                <select
                  required
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                >
                  <option value="">-- Choose Equipment --</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (${eq.rentalPrice}/day) - Available: {eq.stockQuantity ?? eq.quantity ?? 0}
                    </option>
                  ))}
                </select>

                {formData.equipmentId && (() => {
                  const selectedEq = equipmentList.find((eq) => eq.id === formData.equipmentId);
                  const availableStock = selectedEq?.stockQuantity ?? selectedEq?.quantity ?? 0;
                  return (
                    <p className={`text-[11px] mt-1 font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {availableStock > 0 ? `📦 Available in stock: ${availableStock} units` : '❌ Out of stock'}
                    </p>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={
                    formData.equipmentId 
                      ? (equipmentList.find((eq) => eq.id === formData.equipmentId)?.stockQuantity ?? equipmentList.find((eq) => eq.id === formData.equipmentId)?.quantity ?? 999)
                      : 999
                  }
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}