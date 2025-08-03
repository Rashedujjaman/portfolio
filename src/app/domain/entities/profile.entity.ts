export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  phone?: string;
  location: string;
  socialLinks: SocialLink[];
  skills: string[];
  languages: string[];
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}
