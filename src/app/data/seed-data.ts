import { Profile, SocialLink } from '../domain/entities/profile.entity';
import { Project, ProjectCategory, ProjectStatus } from '../domain/entities/project.entity';
import { Experience, Education } from '../domain/entities/experience.entity';
import { Travel } from '../domain/entities/lifestyle.entity';

export const SEED_PROFILE: Partial<Profile> = {
  id: 'main-profile',
  name: 'MD RASHEDUJJAMAN REZA',
  title: 'Software Engineer',
  bio: 'Passionate software engineer with expertise in modern web technologies and clean architecture principles.',
  email: 'reza2001july@gmail.com',
  phone: '+8801792838443',
  location: 'Dhaka, Bangladesh',
  profileImage: '',
  resumeUrl: '',
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/rashedujjaman', icon: 'linkedin' },
    { platform: 'GitHub', url: 'https://github.com/rashedujjaman', icon: 'github' },
    { platform: 'Twitter', url: 'https://twitter.com/rashedujjaman', icon: 'twitter' },
    { platform: 'Website', url: 'https://rashedujjaman.com', icon: 'web' }
  ],
  skills: [
    'Angular', 'TypeScript', 'Firebase', 'Node.js', 'React', 'Python',
    'JavaScript', 'HTML/CSS', 'SCSS', 'Git', 'Docker', 'AWS'
  ],
  languages: ['English', 'Spanish', 'French'],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const SEED_PROJECTS: Partial<Project>[] = [
  {
    id: 'project-1',
    title: 'E-Commerce Platform',
    description: 'A comprehensive e-commerce solution featuring user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Built using modern web technologies with a focus on performance and user experience.',
    shortDescription: 'A full-stack e-commerce platform built with Angular and Node.js',
    category: ProjectCategory.WEB_APPLICATION,
    status: ProjectStatus.COMPLETED,
    technologies: ['Angular', 'Node.js', 'MongoDB', 'Express.js', 'Stripe API'],
    images: [],
    githubUrl: 'https://github.com/yourusername/ecommerce-platform',
    liveUrl: 'https://your-ecommerce-demo.com',
    featured: true,
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-05-20'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'project-2',
    title: 'Task Management App',
    description: 'A modern task management application that allows teams to collaborate in real-time. Features include project boards, task assignments, deadline tracking, and team communication.',
    shortDescription: 'A collaborative task management application with real-time updates',
    category: ProjectCategory.MOBILE_APP,
    status: ProjectStatus.COMPLETED,
    technologies: ['React Native', 'Firebase', 'TypeScript', 'Redux'],
    images: [],
    githubUrl: 'https://github.com/yourusername/task-manager',
    featured: true,
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'project-3',
    title: 'Portfolio Website',
    description: 'A responsive portfolio website showcasing projects, experience, and personal interests. Built with Angular 18+ using clean architecture principles and Firebase for dynamic content management.',
    shortDescription: 'This personal portfolio website built with Angular and Firebase',
    category: ProjectCategory.WEB_APPLICATION,
    status: ProjectStatus.IN_PROGRESS,
    technologies: ['Angular', 'Firebase', 'TypeScript', 'SCSS', 'Angular Material'],
    images: [],
    githubUrl: 'https://github.com/yourusername/portfolio',
    liveUrl: 'https://yourportfolio.com',
    featured: true,
    startDate: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const SEED_EXPERIENCE: Partial<Experience>[] = [
  {
    id: 'exp-1',
    company: 'Tech Company Inc.',
    position: 'Senior Software Engineer',
    description: 'Led development of web applications using Angular and Node.js. Mentored junior developers and contributed to architectural decisions.',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2024-01-01'),
    location: 'City, Country',
    current: false,
    technologies: ['Angular', 'Node.js', 'TypeScript', 'Team Leadership'],
    achievements: [
      'Improved application performance by 40%',
      'Led a team of 5 developers',
      'Implemented CI/CD pipeline'
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const SEED_EDUCATION: Partial<Education>[] = [
  {
    id: 'edu-1',
    institution: 'University Name',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    description: 'Graduated with honors. Focused on software engineering and computer systems.',
    startDate: new Date('2018-09-01'),
    endDate: new Date('2022-05-01'),
    location: 'University City, Country',
    achievements: [
      'Graduated Magna Cum Laude',
      'Dean\'s List for 6 semesters',
      'Computer Science Award recipient'
    ],
    gpa: '3.8/4.0',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const SEED_TRAVEL: Partial<Travel>[] = [
  {
    id: 'travel-1',
    title: 'European Adventure',
    description: 'A month-long journey through Europe visiting major cities and cultural sites.',
    country: 'Multiple',
    city: 'Various',
    visitDate: new Date('2023-07-01'),
    duration: 30,
    images: [],
    highlights: [
      'Visited 8 countries',
      'Explored historic landmarks',
      'Experienced diverse cultures'
    ],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'travel-2',
    title: 'Tokyo Tech Conference',
    description: 'Attended a major technology conference in Tokyo and explored the city.',
    country: 'Japan',
    city: 'Tokyo',
    visitDate: new Date('2023-10-15'),
    duration: 7,
    images: [],
    highlights: [
      'Attended tech conference',
      'Explored traditional temples',
      'Experienced modern Japanese culture'
    ],
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
