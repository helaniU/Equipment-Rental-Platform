'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Search, Filter, Plus, Package, Tag, Pencil, Trash2, AlertTriangle, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

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
  images?: string[];
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
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEquipment, setDeletingEquipment] = useState<EquipmentItem | null>(null);

  // File Uploading States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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

  const userRole = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isWarehouseOperator = userRole === 'WAREHOUSE_OPERATOR';

  const extractArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const eqRes = await api.get('/equipment');
      setEquipment(extractArray(eqRes.data));

      try {
        const catRes = await api.get('/categories');
        setCategories(extractArray(catRes.data));
      } catch {
        const fallbackCatRes = await api.get('/equipment/categories');
        setCategories(extractArray(fallbackCatRes.data));
      }
    } catch (err) {
      console.error('Failed to load equipment or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEquipment(null);
    setFormData({ name: '', description: '', rentalPrice: '', deposit: '', stockQuantity: '', categoryId: '' });
    setUploadedImageUrl(null);
    setIsEquipmentModalOpen(true);
  };

  const handleOpenEditModal = (item: EquipmentItem) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      rentalPrice: item.rentalPrice ? item.rentalPrice.toString() : '0',
      deposit: item.deposit ? item.deposit.toString() : '0',
      stockQuantity: item.stockQuantity ? item.stockQuantity.toString() : '0',
      categoryId: item.category?.id || '',
    });
    setUploadedImageUrl(item.images && item.images.length > 0 ? item.images[0] : null);
    setIsEquipmentModalOpen(true);
  };

  // Image Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', 'EQUIPMENT_IMAGE');

    try {
      const response = await api.post('/uploads/document', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedPath = response.data.filePath || response.data.url;
      const fullUrl = uploadedPath.startsWith('http')
        ? uploadedPath
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${uploadedPath}`;
      setUploadedImageUrl(fullUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      rentalPrice: parseFloat(formData.rentalPrice) || 0,
      deposit: parseFloat(formData.deposit) || 0,
      stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
      categoryId: formData.categoryId,
      images: uploadedImageUrl ? [uploadedImageUrl] : [],
    };

    try {
      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
      setIsEquipmentModalOpen(false);
      setEditingEquipment(null);
      setFormData({ name: '', description: '', rentalPrice: '', deposit: '', stockQuantity: '', categoryId: '' });
      setUploadedImageUrl(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save equipment');
    }
  };

  const handleOpenDeleteModal = (item: EquipmentItem) => {
    setDeletingEquipment(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEquipment = async () => {
    if (!deletingEquipment) return;

    try {
      await api.delete(`/equipment/${deletingEquipment.id}`);
      setIsDeleteModalOpen(false);
      setDeletingEquipment(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      try {
        await api.post('/categories', categoryFormData);
      } catch {
        await api.post('/equipment/categories', categoryFormData);
      }
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
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

        {isWarehouseOperator && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              <Tag className="w-4 h-4" />
              Add Category
            </button>
            <button
              onClick={handleOpenAddModal}
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
                {item.images && item.images.length > 0 && (
                  <div className="w-full h-40 mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                )}
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

              <div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm mb-3">
                  <div>
                    <span className="text-gray-400 text-xs block">Daily Rate</span>
                    <span className="font-bold text-blue-600">LKR {item.rentalPrice}/day</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Deposit</span>
                    <span className="font-semibold text-gray-700">LKR {item.deposit}</span>
                  </div>
                </div>

                {isWarehouseOperator && (
                  <div className="flex gap-2 justify-end border-t pt-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 p-1.5 rounded hover:bg-gray-100 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(item)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            <form onSubmit={handleSaveEquipment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price / Day (LKR)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.rentalPrice}
                    onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Deposit (LKR)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border rounded-lg p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Equipment Image</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center min-h-[110px] bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  {uploadedImageUrl ? (
                    <div className="relative w-full h-28">
                      <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-full object-contain rounded-md" />
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
                      )}
                      <p className="text-xs font-medium text-blue-600">Click to upload image</p>
                      <p className="text-[10px] text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {uploadedImageUrl && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Image uploaded successfully
                  </p>
                )}
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
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingEquipment ? 'Update Equipment' : 'Save Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Equipment?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{deletingEquipment?.name}"</span>?
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEquipment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
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
                  placeholder="e.g. Power Tools"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  placeholder="Brief description"
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