'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Mail, Phone, ShieldCheck, FileText, ExternalLink, Search } from 'lucide-react';

interface Customer {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  createdAt: string;
  identityDocumentUrl?: string;
  rentalAgreementUrl?: string;
  reservations?: any[];
  _count?: {
    reservations?: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/auth/users');
      console.log('Customers loaded:', res.data);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const name = c.fullName || c.name || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Customer Management</h2>
          <p className="text-xs text-gray-500">View registered clients, activity, and uploaded verification documents</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading customer profiles...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-400 text-xs">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          No customers found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Registered On</th>
                <th className="p-4 text-center">Reservations</th>
                <th className="p-4 text-right">Verification Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((cust) => {
                const displayName = cust.fullName || cust.name || 'Customer';

                return (
                  <tr key={cust.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{displayName}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-green-600" /> Verified Account
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {cust.email}
                      </div>
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {cust.phone}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs text-gray-500">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">
                        {cust._count?.reservations ?? cust.reservations?.length ?? 0} Bookings
                        </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {cust.identityDocumentUrl ? (
                        <button
                          onClick={() => setSelectedDocUrl(cust.identityDocumentUrl || null)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg inline-flex items-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> NIC/ID
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No ID</span>
                      )}

                      {cust.rentalAgreementUrl ? (
                        <button
                          onClick={() => setSelectedDocUrl(cust.rentalAgreementUrl || null)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg inline-flex items-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" /> Agreement
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">No Agreement</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-gray-800">Verification Document Viewer</h3>
              <a
                href={selectedDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Original <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
              {selectedDocUrl.endsWith('.pdf') ? (
                <iframe src={selectedDocUrl} className="w-full h-full" />
              ) : (
                <img src={selectedDocUrl} alt="Document" className="max-h-full object-contain" />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDocUrl(null)}
                className="px-4 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}