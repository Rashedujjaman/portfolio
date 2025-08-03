import { Observable } from 'rxjs';
import { BlogPost, Testimonial } from '../entities/content.entity';

export abstract class BlogRepository {
  abstract getBlogPosts(): Observable<BlogPost[]>;
  abstract getBlogPost(id: string): Observable<BlogPost | null>;
  abstract getPublishedBlogPosts(): Observable<BlogPost[]>;
  abstract createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Observable<BlogPost>;
  abstract updateBlogPost(id: string, post: Partial<BlogPost>): Observable<BlogPost>;
  abstract deleteBlogPost(id: string): Observable<void>;
  abstract incrementViews(id: string): Observable<void>;
  abstract incrementLikes(id: string): Observable<void>;
}

export abstract class TestimonialRepository {
  abstract getTestimonials(): Observable<Testimonial[]>;
  abstract getTestimonial(id: string): Observable<Testimonial | null>;
  abstract getFeaturedTestimonials(): Observable<Testimonial[]>;
  abstract createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Observable<Testimonial>;
  abstract updateTestimonial(id: string, testimonial: Partial<Testimonial>): Observable<Testimonial>;
  abstract deleteTestimonial(id: string): Observable<void>;
}
