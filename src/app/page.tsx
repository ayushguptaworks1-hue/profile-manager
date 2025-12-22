'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import ProfileCard from '@/components/ProfileCard';
import FilterPanel from '@/components/FilterPanel';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    availability: '',
    selectedSkills: [] as string[],
    searchQuery: ''
  });

  const ITEMS_PER_PAGE = 8;

  // Initialize filters from URL on mount
  useEffect(() => {
    // Read directly from window.location to handle iframe cases
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || '';
    const availability = urlParams.get('availability') || '';
    const skills = urlParams.get('skills') || '';
    const search = urlParams.get('search') || '';
    
    console.log('Window URL:', window.location.href);
    console.log('URL Parameters loaded:', { role, availability, skills, search });
    
    if (role || availability || skills || search) {
      const parsedFilters = {
        role,
        availability,
        selectedSkills: skills ? skills.split(',').map(s => s.trim()) : [],
        searchQuery: search
      };
      
      console.log('Setting filters:', parsedFilters);
      setFilters(parsedFilters);
    }
  }, []);

  // Fetch profiles from Supabase
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to app format
      const transformedProfiles: Profile[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        experience: item.experience,
        skills: item.skills || [],
        availability: item.availability as 'Available' | 'Busy' | 'On Leave',
        mediaType: item.media_type as 'video' | 'image',
        mediaUrl: item.media_url,
        thumbnailUrl: item.thumbnail_url,
        bio: item.bio,
        email: item.email,
        location: item.location,
        cvUrl: item.cv_url
      }));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const roles = useMemo(() => {
    return Array.from(new Set(profiles.map(p => p.role)));
  }, [profiles]);

  const skills = useMemo(() => {
    const skillsSet = new Set<string>();
    profiles.forEach(p => p.skills.forEach(skill => skillsSet.add(skill)));
    return Array.from(skillsSet).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Search filter
      if (filters.searchQuery && !profile.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }

      // Role filter
      if (filters.role && profile.role !== filters.role) {
        return false;
      }

      // Availability filter
      if (filters.availability && profile.availability !== filters.availability) {
        return false;
      }

      // Skills filter
      if (filters.selectedSkills.length > 0) {
        const hasAllSkills = filters.selectedSkills.every(skill =>
          profile.skills.includes(skill)
        );
        if (!hasAllSkills) {
          return false;
        }
      }

      return true;
    });
  }, [filters, profiles]);

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  // Update URL with current filters
  const updateURL = () => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.selectedSkills.length > 0) params.set('skills', filters.selectedSkills.join(','));
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    window.history.pushState({}, '', newUrl);
  };

  // Reset to page 1 when filters change and update URL
  useEffect(() => {
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.selectedSkills.length > 0) params.set('skills', filters.selectedSkills.join(','));
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    window.history.pushState({}, '', newUrl);
  }, [filters]);

  // Copy filtered URL to clipboard
  const copyFilteredLink = () => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.selectedSkills.length > 0) params.set('skills', filters.selectedSkills.join(','));
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    
    const queryString = params.toString();
    // Use the actual deployed URL to avoid iframe issues
    const baseUrl = 'https://gscoutsourcing.com/team-profile/';
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('copy-btn');
      if (btn) {
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy Link';
        }, 2000);
      }
    });
  };

  // Get current filtered URL
  const getFilteredUrl = () => {
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.selectedSkills.length > 0) params.set('skills', filters.selectedSkills.join(','));
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    
    const queryString = params.toString();
    // Use the actual deployed URL to avoid iframe issues
    const baseUrl = 'https://gscoutsourcing.com/team-profile/';
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Team Profile</h1>
              <p className="text-xl text-indigo-100 max-w-2xl">
                Meet our talented professionals bringing expertise and innovation to every project
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel
              roles={roles}
              skills={skills}
              initialFilters={filters}
              onFilterChange={setFilters}
            />
          </aside>

          {/* Profiles Grid */}
          <div className="lg:col-span-3">
            {/* Shareable Filtered Link */}
            {(filters.role || filters.availability || filters.selectedSkills.length > 0 || filters.searchQuery) && (
              <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 border-2 border-indigo-400 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      📋 Copy this link to share filtered results:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={getFilteredUrl()}
                      onClick={(e) => e.currentTarget.select()}
                      className="w-full px-4 py-3 bg-white border-2 border-white rounded-lg text-sm text-gray-900 font-mono shadow-inner"
                    />
                  </div>
                  <button
                    id="copy-btn"
                    onClick={copyFilteredLink}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-bold text-sm whitespace-nowrap mt-7 shadow-lg"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            )}
            
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
              <p className="text-gray-700 text-lg">
                Showing <span className="font-bold text-indigo-600">{currentProfiles.length}</span> of{' '}
                <span className="font-bold">{filteredProfiles.length}</span> profiles
                {filteredProfiles.length !== profiles.length && ` (${profiles.length} total)`}
              </p>
            </div>
            
            {/* Pagination - Top */}
            {totalPages > 1 && currentProfiles.length > 0 && (
              <div className="mb-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    Next
                  </button>
                </div>
              )}

            {currentProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentProfiles.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">No profiles found</h3>
                <p className="mt-2 text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
