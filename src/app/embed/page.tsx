'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Profile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import ProfileCard from '@/components/ProfileCard';
import FilterPanel from '@/components/FilterPanel';

// Password for accessing the page
const ACCESS_PASSWORD = '19901';

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
  
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const passwordRef = useRef<HTMLDivElement | null>(null);

  const ITEMS_PER_PAGE = 8;

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('profileAccess');
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Auto-scroll to the password card when not authenticated (useful for embedded view)
  useEffect(() => {
    if (!isAuthenticated && passwordRef.current) {
      // Tell the parent WordPress page to scroll the iframe into view
      setTimeout(() => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'scrollToIframe' }, '*');
        }
        // Also try native scrollIntoView as fallback
        passwordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trim input to avoid accidental leading/trailing spaces causing a mismatch
    const attempt = passwordInput.trim();

    if (attempt === ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('profileAccess', 'authenticated');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      // keep the input so user can adjust; optionally clear to avoid accidental reuse
      // setPasswordInput('');
    }
  };

  // Read URL parameters from both iframe URL and parent window URL
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadFiltersFromURL = () => {
      // First try to get params from current window (iframe) URL
      let params = new URLSearchParams(window.location.search);
      
      // If no params in iframe, try to get from parent window URL
      if (!params.toString()) {
        try {
          // Try to read parent window's URL (may fail due to cross-origin)
          const parentParams = new URLSearchParams(window.parent.location.search);
          if (parentParams.toString()) {
            params = parentParams;
          }
        } catch (e) {
          // Cross-origin - parent URL not accessible, that's okay
          console.log('Cannot access parent URL, using iframe URL only');
        }
      }
      
      const role = params.get('role') || '';
      const availability = params.get('availability') || '';
      const skills = params.get('skills') || '';
      const search = params.get('search') || '';
      
      console.log('Embed page - URL params:', { role, availability, skills, search });
      
      if (role || availability || skills || search) {
        setFilters({
          role,
          availability,
          selectedSkills: skills ? skills.split(',').map(s => s.trim()) : [],
          searchQuery: search
        });
      }
    };
    
    loadFiltersFromURL();
    
    // Also listen for messages from parent window with filter parameters
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'setFilters') {
        console.log('Received filters from parent:', event.data.filters);
        const { role, availability, skills, search } = event.data.filters;
        setFilters({
          role: role || '',
          availability: availability || '',
          selectedSkills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
          searchQuery: search || ''
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isAuthenticated]);

  // Update parent window URL when filters change
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const params = new URLSearchParams();
    if (filters.role) params.set('role', filters.role);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.selectedSkills.length > 0) params.set('skills', filters.selectedSkills.join(','));
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    
    const queryString = params.toString();
    
    // Send URL update to parent window (WordPress)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'updateURL',
        queryString: queryString
      }, '*');
    }
  }, [filters, isAuthenticated]);

  // Fetch profiles from Supabase
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
    }
  }, [isAuthenticated]);

  // Hide iframe's own scrollbar - only WordPress parent should scroll
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = 'auto';
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';
    document.body.style.height = 'auto';
    document.body.style.setProperty('overflow', 'hidden', 'important');
  }, []);

  // Send height to parent window for iframe resize
  useEffect(() => {
    const sendHeight = () => {
      // Temporarily allow overflow to get true content height
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'visible';
      document.body.style.overflow = 'visible';
      
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      
      // Re-hide overflow
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'iframeHeight', height }, '*');
      }
    };

    sendHeight();
    
    // Send height on resize and after content loads
    window.addEventListener('resize', sendHeight);
    const interval = setInterval(sendHeight, 300);

    return () => {
      window.removeEventListener('resize', sendHeight);
      clearInterval(interval);
    };
  }, [profiles, currentPage, filters]);

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
        hoursPerWeek: item.hours_per_week || 'Available 40 hrs/week',
        transitionTime: item.transition_time || 'Immediate',
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

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4" style={{ height: '100vh' }}>
        <div ref={passwordRef} className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Protected Content</h2>
            <p className="text-gray-600 mt-2">Enter the password to view team profiles</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2 text-center">Incorrect password. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold text-lg"
            >
              Access Profiles
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                sessionStorage.removeItem('profileAccess');
                setIsAuthenticated(false);
                setPasswordInput('');
                setPasswordError(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Reset Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-transparent flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1" style={{ overflow: 'visible' }}>
            <div style={{ overflow: 'visible' }}>
              <FilterPanel
                roles={roles}
                skills={skills}
                onFilterChange={setFilters}
                isEmbedded
              />
            </div>
          </aside>

          {/* Profiles Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
              <p className="text-gray-700 text-lg">
                Showing <span className="font-bold text-indigo-600">{currentProfiles.length}</span> of{' '}
                <span className="font-bold">{filteredProfiles.length}</span> profiles
                {filteredProfiles.length !== profiles.length && ` (${profiles.length} total)`}
              </p>
              
              {/* Pagination - Top */}
              {totalPages > 1 && currentProfiles.length > 0 && (
                <div className="flex justify-center items-center gap-2">
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
            </div>

            {currentProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentProfiles.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
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
