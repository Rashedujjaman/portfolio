export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  images: string[];
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: ProjectCategory;
  featured: boolean;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  challenges?: string;
  solutions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectCategory {
  WEB_APPLICATION = 'web-application',
  MOBILE_APP = 'mobile-app',
  DESKTOP_APP = 'desktop-app',
  API = 'api',
  LIBRARY = 'library',
  OTHER = 'other'
}

export enum ProjectStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  PLANNED = 'planned',
  ARCHIVED = 'archived'
}
