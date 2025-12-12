export interface Profile {
  id: string;
  name: string;
  role: string;
  experience: string; // e.g., "5 years"
  skills: string[];
  availability: 'In Office' | 'Remote' | 'Available' | 'Busy' | 'On Leave';
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnailUrl?: string; // Optional thumbnail for videos
  bio?: string;
  email?: string;
  location?: string;
  cvUrl?: string;
}

export interface FilterOptions {
  role: string;
  availability: string;
  skills: string[];
}
