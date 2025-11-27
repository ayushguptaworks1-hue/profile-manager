'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Omit<Profile, 'id'>>({
    name: '',
    role: '',
    experience: '',
    skills: [],
    availability: 'In Office',
    mediaType: 'image',
    mediaUrl: '',
    bio: '',
    email: '',
    location: '',
    cvUrl: ''
  });
  const [skillInput, setSkillInput] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    
    // Simple authentication - replace with your credentials
    const ADMIN_EMAIL = 'admin@gscoutsourcing.com';
    const ADMIN_PASSWORD = 'GSC@Admin#2025$Secure!';
    
    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'authenticated');
      setIsAuthenticated(true);
      setLoginError('');
      fetchProfiles();
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Fetch profiles on mount
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProfiles: Profile[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        experience: item.experience,
        skills: item.skills || [],
        availability: item.availability as 'Available' | 'Busy' | 'On Leave',
        mediaType: item.media_type as 'video' | 'image',
        mediaUrl: item.media_url,
        bio: item.bio,
        email: item.email,
        location: item.location,
        cvUrl: item.cv_url
      }));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('Error loading profiles. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            role: formData.role,
            experience: formData.experience,
            skills: formData.skills,
            availability: formData.availability,
            media_type: formData.mediaType,
            media_url: formData.mediaUrl,
            bio: formData.bio || null,
            email: formData.email || null,
            location: formData.location || null,
            cv_url: formData.cvUrl || null
          })
          .eq('id', editingProfile.id);

        if (error) throw error;
        alert('Profile updated successfully!');
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              name: formData.name,
              role: formData.role,
              experience: formData.experience,
              skills: formData.skills,
              availability: formData.availability,
              media_type: formData.mediaType,
              media_url: formData.mediaUrl,
              bio: formData.bio || null,
              email: formData.email || null,
              location: formData.location || null,
              cv_url: formData.cvUrl || null
            }
          ]);

        if (error) throw error;
        alert('Profile added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        role: '',
        experience: '',
        skills: [],
        availability: 'In Office',
        mediaType: 'image',
        mediaUrl: '',
        bio: '',
        email: '',
        location: '',
        cvUrl: ''
      });
      setEditingProfile(null);
      setShowForm(false);
      
      // Refresh profiles list
      fetchProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      role: profile.role,
      experience: profile.experience,
      skills: profile.skills,
      availability: profile.availability,
      mediaType: profile.mediaType,
      mediaUrl: profile.mediaUrl,
      bio: profile.bio || '',
      email: profile.email || '',
      location: profile.location || '',
      cvUrl: profile.cvUrl || ''
    });
    setShowForm(true);
    
    // Scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      role: '',
      experience: '',
      skills: [],
      availability: 'In Office',
      mediaType: 'image',
      mediaUrl: '',
      bio: '',
      email: '',
      location: '',
      cvUrl: ''
    });
    setShowForm(false);
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Profile deleted successfully!');
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter your credentials to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Profiles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage team member profiles</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Logout
              </button>
              <Link
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
              >
                View Profiles
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Profile Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setShowForm(true);
              }
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            {showForm ? 'Cancel' : '+ Add New Profile'}
          </button>
        </div>

        {/* Add/Edit Profile Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 years"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Work Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="In Office">In Office</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* CV URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CV/Resume URL</label>
                  <input
                    type="url"
                    name="cvUrl"
                    value={formData.cvUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/cv.pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Media Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Media Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mediaType"
                    value={formData.mediaType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {/* Media URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.mediaType === 'video' ? 'Video' : 'Image'} URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/media.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Enter a skill and press Add"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.skills.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No skills added yet. Add at least one skill.</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={formData.skills.length === 0}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {editingProfile ? 'Update Profile' : 'Add Profile'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profiles List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Profiles ({profiles.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Work Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{profile.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{profile.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{profile.experience}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.availability === 'In Office' ? 'bg-blue-100 text-blue-800' :
                        profile.availability === 'Remote' ? 'bg-green-100 text-green-800' :
                        profile.availability === 'Available' ? 'bg-green-100 text-green-800' :
                        profile.availability === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profile.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{profile.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleEditProfile(profile)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
