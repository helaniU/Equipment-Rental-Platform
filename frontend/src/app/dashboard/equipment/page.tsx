'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Search, Filter, Plus, Package, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  deposit: number;
  stockQuantity: number;
  isAvailable: boolean;
  category?: Category;
}

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Forms State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rentalPrice: '',
    deposit: '',
    stockQuantity: '',
    categoryId: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });

  // Role check using AuthContext
  const userRole = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isStaffOrAdmin = userRole === 'ADMIN' || userRole === 'STAFF';

  const fetchData = async () => {
    try {
      const [eqRes, catRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/equipment/categories').catch(() => ({ data: [] })), // Fixed route!
      ]);
      setEquipment(eqRes.data);
      setCategories(catRes.data);
    } catch {
      console.warn('Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      await api.post('/equipment', {
        ...formData,
        rentalPrice: parseFloat(formData.rentalPrice),
        deposit: parseFloat(formData.deposit),
        stockQuantity: parseInt(formData.stockQuantity, 10),
      });
      setIsEquipmentModalOpen(false);
      setFormData({ name: '', description: '', rentalPrice: '', deposit: '', stockQuantity: '', categoryId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create equipment');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/equipment/categories', categoryFormData);
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory ? item.category?.id === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {isStaffOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              <Tag className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={() => setIsEquipmentModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>
        )}
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading catalog...</div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          No equipment items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      item.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.stockQuantity > 0 ? `${item.stockQuantity} In Stock` : 'Out of Stock'}
                  </span>
                </div>

                {item.category && (
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium mb-2">
                    {item.category.name}
                  </span>
                )}

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {item.description || 'No description available.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Daily Rate</span>
                  <span className="font-bold text-blue-600">${item.rentalPrice}/day</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Deposit</span>
                  <span className="font-semibold text-gray-700">${item.deposit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add New Equipment</h3>
            <form onSubmit={handleCreateEquipment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price / Day ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.rentalPrice}
                    onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Deposit ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEquipmentModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Machinery, Power Tools"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  placeholder="Brief description of category"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}