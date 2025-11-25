import { Profile } from '@/types/profile';

// Mock data - In production, this would come from a database
export const profiles: Profile[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Financial Analyst',
    experience: '6 years',
    skills: ['Financial Modeling', 'Excel', 'Power BI', 'Budgeting'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Expert in financial forecasting and strategic planning with extensive experience in corporate finance.',
    email: 'sarah.j@company.com',
    location: 'New York, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Tax Accountant',
    experience: '4 years',
    skills: ['Tax Compliance', 'IRS Regulations', 'Tax Planning', 'QuickBooks'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    bio: 'Specialized in corporate tax compliance and optimization strategies.',
    email: 'michael.c@company.com',
    location: 'San Francisco, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '3',
    name: 'Emma Williams',
    role: 'Cost Accountant',
    experience: '5 years',
    skills: ['Cost Analysis', 'SAP', 'Variance Analysis', 'Management Accounting'],
    availability: 'Available',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    bio: 'Experienced in cost optimization and financial reporting for manufacturing operations.',
    email: 'emma.w@company.com',
    location: 'London, UK',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '4',
    name: 'James Rodriguez',
    role: 'Audit Manager',
    experience: '7 years',
    skills: ['Internal Audit', 'Risk Assessment', 'GAAP', 'SOX Compliance'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    bio: 'Leading audit teams to ensure compliance and improve internal controls.',
    email: 'james.r@company.com',
    location: 'Austin, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '5',
    name: 'Sophia Lee',
    role: 'Payroll Specialist',
    experience: '3 years',
    skills: ['Payroll Processing', 'ADP', 'Benefits Administration', 'Compliance'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    bio: 'Managing accurate and timely payroll processing for 500+ employees.',
    email: 'sophia.l@company.com',
    location: 'Seattle, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '6',
    name: 'David Martinez',
    role: 'Financial Controller',
    experience: '8 years',
    skills: ['Financial Reporting', 'IFRS', 'ERP Systems', 'Team Management'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    bio: 'Overseeing all accounting operations and financial reporting for multinational corporation.',
    email: 'david.m@company.com',
    location: 'Chicago, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '7',
    name: 'Rachel Thompson',
    role: 'Accounts Payable Manager',
    experience: '5 years',
    skills: ['AP Management', 'Vendor Relations', 'NetSuite', 'Process Improvement'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    bio: 'Streamlining accounts payable processes and managing vendor relationships.',
    email: 'rachel.t@company.com',
    location: 'Boston, USA',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '8',
    name: 'Alex Kumar',
    role: 'Treasury Analyst',
    experience: '4 years',
    skills: ['Cash Management', 'Investment Analysis', 'Bloomberg Terminal', 'Forex'],
    availability: 'Available',
    mediaType: 'image',
    mediaUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Managing corporate liquidity and investment portfolios to maximize returns.',
    email: 'alex.k@company.com',
    location: 'Toronto, Canada',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

// Get all unique roles
export const getAllRoles = (): string[] => {
  return Array.from(new Set(profiles.map(p => p.role)));
};

// Get all unique skills
export const getAllSkills = (): string[] => {
  const skillsSet = new Set<string>();
  profiles.forEach(p => p.skills.forEach(skill => skillsSet.add(skill)));
  return Array.from(skillsSet).sort();
};
