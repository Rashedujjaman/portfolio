export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  published: boolean;
  publishedDate?: Date;
  readingTime: number; // in minutes
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
