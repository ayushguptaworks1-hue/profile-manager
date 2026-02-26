export type HoursPerWeek = 'Available 20 hrs/week' | 'Available 40 hrs/week' | 'Not Available';
export type TransitionTime = 'Immediate' | '15 days' | '30 days' | '45 days' | '60 days';

export interface Profile {
  id: string;
  name: string;
  role: string;
  experience: string; // e.g., "5 years"
  skills: string[];
  hoursPerWeek: HoursPerWeek;
  transitionTime: TransitionTime;
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
  hoursPerWeek: string;
  transitionTime: string;
  skills: string[];
}
