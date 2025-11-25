'use client';

import { useState, useMemo, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import ProfileCard from '@/components/ProfileCard';
import FilterPanel from '@/components/FilterPanel';

export default function EmbedPage() {
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Main Content - No Header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel
              roles={roles}
              skills={skills}
              onFilterChange={setFilters}
            />
          </aside>

          {/* Profiles Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-700 text-lg">
                Showing <span className="font-bold text-indigo-600">{currentProfiles.length}</span> of{' '}
                <span className="font-bold">{filteredProfiles.length}</span> profiles
                {filteredProfiles.length !== profiles.length && ` (${profiles.length} total)`}
              </p>
            </div>

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
