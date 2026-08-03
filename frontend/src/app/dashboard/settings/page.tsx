'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { User, Lock, Bell, Shield, CheckCircle2, Save, FileText, Upload, Loader2, ExternalLink } from 'lucide-react';

interface UploadedDocument {
  id: string;
  filePath: string;
  type: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { user } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Document Upload State
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [myDocuments, setMyDocuments] = useState<UploadedDocument[]>([]);

  // Success Message State
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roleName = (typeof user?.role === 'object' ? user?.role?.name : user?.role) || 'USER';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch User's Uploaded Documents on Load
  useEffect(() => {
    const fetchUserDocs = async () => {
      try {
        const res = await api.get('/uploads/my-documents');
        if (Array.isArray(res.data)) {
          setMyDocuments(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch user documents:', err);
      }
    };

    if (user) {
      fetchUserDocs();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage(null);

    try {
      await api.patch('/users/me', {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setUploadingDoc(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'IDENTITY_DOCUMENT');

    try {
      const res = await api.post('/uploads/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({ type: 'success', text: 'Identity document uploaded successfully!' });
      
      // Refresh user document list
      const updatedDocs = await api.get('/uploads/my-documents');
      if (Array.isArray(updatedDocs.data)) {
        setMyDocuments(updatedDocs.data);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Account & System Settings</h2>
        <p className="text-xs text-gray-500">Manage your profile information, verification documents, and security</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile & Verification
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Lock className="w-4 h-4" /> Security & Password
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'preferences'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bell className="w-4 h-4" /> System Preferences
        </button>
      </div>

      {/* TAB 1: PROFILE & VERIFICATION */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-14 h-14 bg-blue-100 text-blue-700 font-extrabold text-xl rounded-full flex items-center justify-center uppercase">
                {(fullName || user?.email || 'U').charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{fullName || 'User Profile'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{user?.email}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-bold text-[10px] uppercase">
                    {roleName}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full border rounded-lg p-2.5 text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  placeholder="+94 7X XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Identity Verification Documents Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Identity Verification Documents
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Upload NIC / Passport copies for reservation authorization</p>
            </div>

            {/* Document Upload Box */}
            <div className="relative border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 p-5 rounded-lg flex flex-col items-center justify-center transition max-w-lg cursor-pointer">
              {uploadingDoc ? (
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" /> Uploading document...
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <div className="text-xs font-semibold text-gray-700">
                    Click to upload <span className="text-blue-600 underline">NIC or Passport</span>
                  </div>
                  <p className="text-[10px] text-gray-400">PDF, JPG, or PNG up to 5MB</p>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg, image/png, application/pdf"
                onChange={handleDocumentUpload}
                disabled={uploadingDoc}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Uploaded Files History */}
            {myDocuments.length > 0 && (
              <div className="mt-4 space-y-2 max-w-lg">
                <h4 className="text-xs font-semibold text-gray-600">Uploaded Documents</h4>
                <div className="space-y-2">
                  {myDocuments.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    >
                        <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate text-gray-700 font-medium">
                            {(doc.filePath?.split('-').slice(1).join('-')) || 'Uploaded Document'}
                        </span>
                        </div>
                        {doc.filePath && (
                        <a
                            href={`${API_URL}${doc.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 ml-2 text-[11px]"
                        >
                            View <ExternalLink className="w-3 h-3" />
                        </a>
                        )}
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Change Password
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Ensure your account uses a strong password to stay secure.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-gray-900">Notification & System Options</h3>
            <p className="text-xs text-gray-500 mt-0.5">Customize background alert settings and platform preferences</p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="text-xs font-bold text-gray-800">Email Notifications</div>
                <div className="text-[11px] text-gray-500">Receive status updates for reservations & rental returns</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}