'use client';

import { useState, useEffect } from 'react';

interface FilterPanelProps {
  roles: string[];
  skills: string[];
  initialFilters?: {
    role: string;
    availability: string;
    selectedSkills: string[];
    searchQuery: string;
  };
  onFilterChange: (filters: {
    role: string;
    availability: string;
    selectedSkills: string[];
    searchQuery: string;
  }) => void;
}

export default function FilterPanel({ roles, skills, initialFilters, onFilterChange }: FilterPanelProps) {
  const [role, setRole] = useState(initialFilters?.role || '');
  const [availability, setAvailability] = useState(initialFilters?.availability || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialFilters?.selectedSkills || []);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');

  // Update local state when initialFilters change (from URL)
  useEffect(() => {
    if (initialFilters) {
      setRole(initialFilters.role);
      setAvailability(initialFilters.availability);
      setSelectedSkills(initialFilters.selectedSkills);
      setSearchQuery(initialFilters.searchQuery);
    }
  }, [initialFilters]);

  const [showLinkBox, setShowLinkBox] = useState(false);

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    onFilterChange({ role, availability, selectedSkills: newSkills, searchQuery });
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    onFilterChange({ role: newRole, availability, selectedSkills, searchQuery });
  };

  const handleAvailabilityChange = (newAvailability: string) => {
    setAvailability(newAvailability);
    onFilterChange({ role, availability: newAvailability, selectedSkills, searchQuery });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFilterChange({ role, availability, selectedSkills, searchQuery: query });
  };

  const handleClearFilters = () => {
    setRole('');
    setAvailability('');
    setSelectedSkills([]);
    setSearchQuery('');
    onFilterChange({ role: '', availability: '', selectedSkills: [], searchQuery: '' });
  };

  const getShareableLink = () => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (availability) params.set('availability', availability);
    if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
    if (searchQuery) params.set('search', searchQuery);
    
    const queryString = params.toString();
    // Use WordPress URL so it works with the iframe setup
    const baseUrl = 'https://gscoutsourcing.com/team-profile/';
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const copyShareableLink = () => {
    setShowLinkBox(true);
  };

  const hasActiveFilters = role || availability || selectedSkills.length > 0 || searchQuery;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
        <button
          onClick={handleClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Get Shareable Link Button */}
      {hasActiveFilters && (
        <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
          {!showLinkBox ? (
            <button
              onClick={copyShareableLink}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-bold text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              📋 Get Shareable Link
            </button>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                📋 Copy this link to share:
              </label>
              <input
                type="text"
                readOnly
                value={getShareableLink()}
                onClick={(e) => {
                  e.currentTarget.select();
                  navigator.clipboard.writeText(getShareableLink());
                }}
                className="w-full px-3 py-2 bg-white border-2 border-green-500 rounded text-xs text-gray-900 font-mono mb-2"
              />
              <button
                onClick={() => setShowLinkBox(false)}
                className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
              >
                Close
              </button>
            </div>
          )}
          <p className="text-xs text-gray-600 mt-2 text-center">
            Share filtered results with clients
          </p>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">  
        <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Skills Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Skills</label>
        
        {/* Selected Skills - Shown at top */}
        {selectedSkills.length > 0 && (
          <div className="mb-3 pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
              Selected ({selectedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <button
                  key={`selected-${skill}`}
                  onClick={() => handleSkillToggle(skill)}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1"
                >
                  {skill}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* All Skills */}
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {skills
            .filter(skill => !selectedSkills.includes(skill))
            .map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              >
                {skill}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
