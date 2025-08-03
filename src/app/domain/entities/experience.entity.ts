export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  companyWebsite?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  achievements: string[];
  description?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}
