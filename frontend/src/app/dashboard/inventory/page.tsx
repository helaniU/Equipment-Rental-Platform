'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Boxes, RefreshCw, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  availableQuantity: number;
  maintenanceQuantity: number;
  location: string;
  category?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionType, setActionType] = useState<'RECEIVE' | 'RELEASE' | 'MAINTENANCE' | 'DAMAGE'>('RECEIVE');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch {
      console.warn('Could not retrieve inventory from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.post('/inventory/action', {
        equipmentId: selectedItem.id,
        action: actionType,
        quantity: parseInt(quantity, 10),
        notes: notes || undefined,
      });

      setSelectedItem(null);
      setQuantity('1');
      setNotes('');
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record inventory action');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Inventory & Stock Tracking</h2>
          <p className="text-xs text-gray-500">Manage warehouse stock levels and maintenance statuses</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Inventory Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading stock records...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
          <Boxes className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          No inventory records found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="p-4">Equipment Item</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Warehouse Location</th>
                <th className="p-4 text-center">Total Stock</th>
                <th className="p-4 text-center">Available</th>
                <th className="p-4 text-center">Maintenance</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="p-4 text-xs font-mono text-gray-500">{item.sku}</td>
                  <td className="p-4 text-xs text-gray-600">{item.location}</td>
                  <td className="p-4 text-center font-bold text-gray-900">{item.stockQuantity}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded-md inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {item.availableQuantity}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {item.maintenanceQuantity > 0 ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-md inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {item.maintenanceQuantity}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">0</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setQuantity('1');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Record Stock Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Stock Action</h3>
            <p className="text-xs text-gray-500">
              Item: <span className="font-semibold text-gray-800">{selectedItem.name}</span>
            </p>

            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RECEIVE">Receive Stock (+)</option>
                  <option value="RELEASE">Release Stock (-)</option>
                  <option value="MAINTENANCE">Move to Maintenance (-)</option>
                  <option value="DAMAGE">Record Damaged/Lost (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Shipment #104, Routine Service"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium"
                >
                  Submit Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}