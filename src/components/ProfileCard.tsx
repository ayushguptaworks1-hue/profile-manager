'use client';

import { Profile } from '@/types/profile';
import { useState } from 'react';

interface ProfileCardProps {
  profile: Profile;
}

// Helper function to convert Google Drive link to embeddable format
function getEmbedUrl(url: string): { type: 'video' | 'iframe', url: string } {
  // Check if it's a YouTube link (including Shorts)
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'iframe',
      url: `https://www.youtube.com/embed/${videoId}`
    };
  }
  
  // Check if it's a Google Drive link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return {
      type: 'iframe',
      url: `https://drive.google.com/file/d/${fileId}/preview`
    };
  }
  
  // Check if it's already a Google Drive preview link
  if (url.includes('drive.google.com') && url.includes('/preview')) {
    return { type: 'iframe', url };
  }
  
  // For regular video URLs (direct links)
  return { type: 'video', url };
}

// Helper function to convert Google Drive image link to direct URL
function getDirectImageUrl(url: string): string {
  if (!url) return url;
  
  // Check if it's a Google Drive link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  return url;
}


export default function ProfileCard({ profile }: ProfileCardProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    message: ''
  });

  const availabilityColors = {
    'In Office': 'bg-blue-100 text-blue-800 border-blue-300',
    'Remote': 'bg-green-100 text-green-800 border-green-300',
    'Available': 'bg-green-100 text-green-800 border-green-300',
    'Busy': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'On Leave': 'bg-red-100 text-red-800 border-red-300'
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email content with visitor info and profile link
    const profileLink = window.location.href;
    const emailBody = `
New Contact Request for ${profile.name}

Visitor Information:
Name: ${formData.visitorName}
Email: ${formData.visitorEmail}
Phone: ${formData.visitorPhone}

Message:
${formData.message}

Profile Link: ${profileLink}
    `.trim();

    // Send to profile owner's email
    const mailtoLink = `mailto:${profile.email}?subject=Contact Request from ${formData.visitorName}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Close modal and reset form
    setShowContactModal(false);
    setFormData({ visitorName: '', visitorEmail: '', visitorPhone: '', message: '' });
    alert('Your contact request is being sent!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Media Section */}
      <div className="relative w-full h-64 bg-gray-200">
        {/* Always show image/thumbnail, even for video profiles */}
        <img
          src={profile.mediaType === 'video' && profile.thumbnailUrl 
            ? getDirectImageUrl(profile.thumbnailUrl) 
            : profile.mediaUrl}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        
        {/* Video Play Button Overlay - only show if this is a video profile */}
        {profile.mediaType === 'video' && (
          <button
            onClick={() => setShowVideoModal(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group"
          >
            <div className="bg-indigo-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${availabilityColors[profile.availability]}`}>
            {profile.availability}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h3>
        <p className="text-lg text-indigo-600 font-semibold mb-2">{profile.role}</p>
        
        <div className="flex items-center text-gray-600 mb-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">{profile.experience} experience</span>
        </div>

        {profile.location && (
          <div className="flex items-center text-gray-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">{profile.location}</span>
          </div>
        )}

        {profile.bio && (
          <p className="text-gray-700 mb-4 text-sm">{profile.bio}</p>
        )}

        {/* Skills */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {profile.email && (
            <button
              onClick={() => setShowContactModal(true)}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Contact
            </button>
          )}
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-center flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View CV
            </a>
          )}
          {profile.mediaType === 'video' && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              View Video
            </button>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact {profile.name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                <input
                  type="email"
                  required
                  value={formData.visitorEmail}
                  onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.visitorPhone}
                  onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="+1 (234) 567-8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="I would like to discuss..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && profile.mediaType === 'video' && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4" onClick={() => setShowVideoModal(false)}>
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 bg-black bg-opacity-50 px-4 py-2 rounded-lg"
            >
              <span className="text-sm font-medium">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-black rounded-lg overflow-hidden shadow-2xl relative">
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-white text-center">
                    <svg className="animate-spin h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Loading video...</p>
                  </div>
                </div>
              )}
              {profile.mediaUrl ? (
                (() => {
                  const embedData = getEmbedUrl(profile.mediaUrl);
                  console.log('Video Modal - URL:', profile.mediaUrl, 'Embed Data:', embedData);
                  return embedData.type === 'iframe' ? (
                    <iframe
                      src={embedData.url}
                      className="w-full aspect-video"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      onLoad={() => setVideoLoading(false)}
                    />
                  ) : (
                    <video
                      src={embedData.url}
                      controls
                      autoPlay
                      controlsList="nodownload"
                      className="w-full aspect-video object-contain bg-black"
                      onLoadedData={() => setVideoLoading(false)}
                      onError={(e) => {
                        console.error('Video load error:', e);
                        setVideoLoading(false);
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                })()
              ) : (
                <div className="w-full aspect-video flex items-center justify-center text-white">
                  <p>No video URL available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
