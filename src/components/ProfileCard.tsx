'use client';

import { Profile } from '@/types/profile';

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const availabilityColors = {
    'Available': 'bg-green-100 text-green-800 border-green-300',
    'Busy': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'On Leave': 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Media Section */}
      <div className="relative w-full h-64 bg-gray-200">
        {profile.mediaType === 'video' ? (
          <video
            src={profile.mediaUrl}
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={profile.mediaUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
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
              onClick={() => window.location.href = `mailto:${profile.email}`}
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
        </div>
      </div>
    </div>
  );
}
