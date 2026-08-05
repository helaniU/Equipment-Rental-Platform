'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle2, XCircle, Clock, Plus, CreditCard, AlertTriangle, X, RefreshCw, ShieldCheck } from 'lucide-react';

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
  status: string;
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

  const [currentTime, setCurrentTime] = useState('10 : 03');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours} : ${minutes}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Custom Payment Modal State & Form Fields
  const [selectedPaymentReservation, setSelectedPaymentReservation] = useState<Reservation | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '4342 •••• •••• 3446',
    cvv: '446',
    expiryMonth: '10',
    expiryYear: '24',
    password: '••••••••',
  });

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
      patchReservationLocally(id, { status });
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

  const confirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentReservation) return;

    setIsPaying(true);
    try {
      await api.post('/payments/process', {
        reservationId: selectedPaymentReservation.id,
        amount: Number(selectedPaymentReservation.totalPrice),
        type: 'RENTAL_FEE',
        paymentMethod: 'MOCK_CARD',
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
        return <span className="px-2.5 py-1 bg-violet-100 text-violet-800 text-xs font-semibold rounded-full flex items-center gap-1 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> REFUNDED</span>;
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

                const isPaidStatus = res.isPaid || res.paymentStatus === 'PAID';

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
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {getStatusBadge(res)}
                        {isPaidStatus && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1 w-fit shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" /> PAID
                          </span>
                        )}
                      </div>
                    </td>
                    
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

                      {!isStaffOrAdmin && res.status === 'APPROVED' && !isPaidStatus && (
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
                          {isPaidStatus ? 'Request Refund' : 'Cancel'}
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

      {/* Cancel / Refund Modal */}
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

      {/* Rejection Reason Modal */}
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

      {/* Mock Payment Gateway Modal matching the design */}
      {selectedPaymentReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedPaymentReservation(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  ⚡
                </div>
                <span className="font-bold text-gray-900 text-lg">Meiranpay</span>
              </div>
              <div className="bg-gray-900 text-white text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentTime}</span>
              </div>
            </div>

            <form onSubmit={confirmPayment} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Card Number</label>
                  <p className="text-[11px] text-gray-400 mb-1.5">Enter the 16-digit card number on the card</p>
                  <div className="relative flex items-center border rounded-xl px-3 py-2.5 bg-white border-gray-200 focus-within:border-blue-600">
                    <span className="mr-2 text-xl">💳</span>
                    <input
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                      className="w-full text-xs font-mono text-gray-800 focus:outline-none bg-transparent"
                      required
                    />
                    <CheckCircle2 className="w-4 h-4 text-blue-600 ml-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">CVV Number</label>
                    <p className="text-[11px] text-gray-400 mb-1.5">3 or 4 digits</p>
                    <input
                      type="password"
                      maxLength={4}
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs text-center font-mono border-gray-200 focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">Expiry Date</label>
                    <p className="text-[11px] text-gray-400 mb-1.5">MM / YY</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={2}
                        value={paymentForm.expiryMonth}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                        className="w-1/2 border rounded-xl p-2.5 text-xs text-center font-mono border-gray-200 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <input
                        type="text"
                        maxLength={2}
                        value={paymentForm.expiryYear}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                        className="w-1/2 border rounded-xl p-2.5 text-xs text-center font-mono border-gray-200 focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Password</label>
                  <p className="text-[11px] text-gray-400 mb-1.5">Enter your Dynamic password</p>
                  <input
                    type="password"
                    value={paymentForm.password}
                    onChange={(e) => setPaymentForm({ ...paymentForm, password: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs font-mono border-gray-200 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="md:col-span-5 bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="bg-gradient-to-tr from-gray-900 to-blue-900 text-white p-4 rounded-xl shadow-md space-y-4">
                  <div className="flex justify-between items-center text-xs opacity-80">
                    <span>💳 Chip</span>
                    <span>Mastercard</span>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70">Cardholder Name</p>
                    <p className="text-xs font-semibold tracking-wide">
                      {selectedPaymentReservation.customer?.fullName || 
                       selectedPaymentReservation.customer?.name || 
                       selectedPaymentReservation.user?.fullName || 
                       selectedPaymentReservation.user?.name || 
                       user?.fullName || 'Customer'}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-mono text-xs tracking-wider">•••• 3446</span>
                    <span className="font-mono text-xs">09/24</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 border-t border-dashed border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span>Company</span>
                    <span className="font-semibold text-gray-800">Equipment Rental Platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Number</span>
                    <span className="font-mono text-gray-800">#{selectedPaymentReservation.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                      {selectedPaymentReservation.items?.map((i) => i.equipment?.name).join(', ') || 'Gear'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%)</span>
                    <span className="text-gray-800">${(Number(selectedPaymentReservation.totalPrice) * 0.2).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400">You have to Pay</p>
                    <p className="text-lg font-bold text-blue-600">${selectedPaymentReservation.totalPrice} <span className="text-[10px] text-gray-500 font-normal">USD</span></p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 pt-2">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  {isPaying ? 'Processing Payment...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
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