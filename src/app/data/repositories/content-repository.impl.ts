import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogRepository, TestimonialRepository } from '../../domain/repositories/content.repository';
import { BlogPost, Testimonial } from '../../domain/entities/content.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class BlogRepositoryImpl implements BlogRepository {
  private firebaseDataSource = inject(FirebaseDataSource);

  getBlogPosts(): Observable<BlogPost[]> {
    return this.firebaseDataSource.getAll<BlogPost>('blog-posts', [
      this.firebaseDataSource.createOrderByCondition('publishedDate', 'desc')
    ]);
  }

  getBlogPost(id: string): Observable<BlogPost | null> {
    return this.firebaseDataSource.getById<BlogPost>('blog-posts', id);
  }

  getPublishedBlogPosts(): Observable<BlogPost[]> {
    return this.firebaseDataSource.getAll<BlogPost>('blog-posts', [
      this.firebaseDataSource.createWhereCondition('published', '==', true),
      this.firebaseDataSource.createOrderByCondition('publishedDate', 'desc')
    ]);
  }

  createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Observable<BlogPost> {
    return this.firebaseDataSource.create<BlogPost>('blog-posts', post);
  }

  updateBlogPost(id: string, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.firebaseDataSource.update<BlogPost>('blog-posts', id, post);
  }

  deleteBlogPost(id: string): Observable<void> {
    return this.firebaseDataSource.delete('blog-posts', id);
  }

  incrementViews(id: string): Observable<void> {
    return this.firebaseDataSource.increment('blog-posts', id, 'views', 1);
  }

  incrementLikes(id: string): Observable<void> {
    return this.firebaseDataSource.increment('blog-posts', id, 'likes', 1);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialRepositoryImpl implements TestimonialRepository {
  private firebaseDataSource = inject(FirebaseDataSource);

  getTestimonials(): Observable<Testimonial[]> {
    return this.firebaseDataSource.getAll<Testimonial>('testimonials', [
      this.firebaseDataSource.createOrderByCondition('createdAt', 'desc')
    ]);
  }

  getTestimonial(id: string): Observable<Testimonial | null> {
    return this.firebaseDataSource.getById<Testimonial>('testimonials', id);
  }

  getFeaturedTestimonials(): Observable<Testimonial[]> {
    return this.firebaseDataSource.getAll<Testimonial>('testimonials', [
      this.firebaseDataSource.createWhereCondition('featured', '==', true),
      this.firebaseDataSource.createOrderByCondition('rating', 'desc')
    ]);
  }

  createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Observable<Testimonial> {
    return this.firebaseDataSource.create<Testimonial>('testimonials', testimonial);
  }

  updateTestimonial(id: string, testimonial: Partial<Testimonial>): Observable<Testimonial> {
    return this.firebaseDataSource.update<Testimonial>('testimonials', id, testimonial);
  }

  deleteTestimonial(id: string): Observable<void> {
    return this.firebaseDataSource.delete('testimonials', id);
  }
}
