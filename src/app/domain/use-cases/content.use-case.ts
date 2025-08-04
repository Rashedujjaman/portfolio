import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost, Testimonial } from '../entities/content.entity';
import { BlogRepository, TestimonialRepository } from '../repositories/content.repository';

// Blog Use Cases
@Injectable({
  providedIn: 'root'
})
export class GetBlogPostsUseCase {
  private blogRepository = inject(BlogRepository);

  execute(): Observable<BlogPost[]> {
    return this.blogRepository.getBlogPosts();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetPublishedBlogPostsUseCase {
  private blogRepository = inject(BlogRepository);

  execute(): Observable<BlogPost[]> {
    return this.blogRepository.getPublishedBlogPosts();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetBlogPostByIdUseCase {
  private blogRepository = inject(BlogRepository);

  execute(id: string): Observable<BlogPost | null> {
    return this.blogRepository.getBlogPost(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CreateBlogPostUseCase {
  private blogRepository = inject(BlogRepository);

  execute(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Observable<BlogPost> {
    return this.blogRepository.createBlogPost(post);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateBlogPostUseCase {
  private blogRepository = inject(BlogRepository);

  execute(id: string, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.blogRepository.updateBlogPost(id, post);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteBlogPostUseCase {
  private blogRepository = inject(BlogRepository);

  execute(id: string): Observable<void> {
    return this.blogRepository.deleteBlogPost(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class IncrementBlogViewsUseCase {
  private blogRepository = inject(BlogRepository);

  execute(id: string): Observable<void> {
    return this.blogRepository.incrementViews(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class IncrementBlogLikesUseCase {
  private blogRepository = inject(BlogRepository);

  execute(id: string): Observable<void> {
    return this.blogRepository.incrementLikes(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetBlogPostsByCategoryUseCase {
  private blogRepository = inject(BlogRepository);

  execute(category: string): Observable<BlogPost[]> {
    return this.blogRepository.getPublishedBlogPosts().pipe(
      map(posts => posts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      ))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetBlogPostsByTagUseCase {
  private blogRepository = inject(BlogRepository);

  execute(tag: string): Observable<BlogPost[]> {
    return this.blogRepository.getPublishedBlogPosts().pipe(
      map(posts => posts.filter(post => 
        post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      ))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class SearchBlogPostsUseCase {
  private blogRepository = inject(BlogRepository);

  execute(query: string): Observable<BlogPost[]> {
    const searchTerm = query.toLowerCase();
    return this.blogRepository.getPublishedBlogPosts().pipe(
      map(posts => posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      ))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetBlogStatsUseCase {
  private blogRepository = inject(BlogRepository);

  execute(): Observable<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    categoryCounts: { [key: string]: number };
    popularTags: { tag: string; count: number }[];
  }> {
    return this.blogRepository.getBlogPosts().pipe(
      map(posts => {
        const published = posts.filter(p => p.published);
        const categoryCounts: { [key: string]: number } = {};
        const tagCounts: { [key: string]: number } = {};

        posts.forEach(post => {
          // Count categories
          categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
          
          // Count tags
          post.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const popularTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          totalPosts: posts.length,
          publishedPosts: published.length,
          draftPosts: posts.length - published.length,
          totalViews: posts.reduce((sum, post) => sum + post.views, 0),
          totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
          categoryCounts,
          popularTags
        };
      })
    );
  }
}

// Testimonial Use Cases
@Injectable({
  providedIn: 'root'
})
export class GetTestimonialsUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(): Observable<Testimonial[]> {
    return this.testimonialRepository.getTestimonials();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetFeaturedTestimonialsUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(): Observable<Testimonial[]> {
    return this.testimonialRepository.getFeaturedTestimonials();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTestimonialByIdUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(id: string): Observable<Testimonial | null> {
    return this.testimonialRepository.getTestimonial(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CreateTestimonialUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Observable<Testimonial> {
    return this.testimonialRepository.createTestimonial(testimonial);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateTestimonialUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(id: string, testimonial: Partial<Testimonial>): Observable<Testimonial> {
    return this.testimonialRepository.updateTestimonial(id, testimonial);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteTestimonialUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(id: string): Observable<void> {
    return this.testimonialRepository.deleteTestimonial(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTestimonialsByRatingUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(minRating: number): Observable<Testimonial[]> {
    return this.testimonialRepository.getTestimonials().pipe(
      map(testimonials => testimonials.filter(t => t.rating >= minRating))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTestimonialStatsUseCase {
  private testimonialRepository = inject(TestimonialRepository);

  execute(): Observable<{
    totalTestimonials: number;
    featuredCount: number;
    averageRating: number;
    ratingDistribution: { [rating: number]: number };
    topCompanies: string[];
  }> {
    return this.testimonialRepository.getTestimonials().pipe(
      map(testimonials => {
        const ratingDistribution: { [rating: number]: number } = {};
        const companyCounts: { [company: string]: number } = {};

        testimonials.forEach(testimonial => {
          ratingDistribution[testimonial.rating] = (ratingDistribution[testimonial.rating] || 0) + 1;
          companyCounts[testimonial.company] = (companyCounts[testimonial.company] || 0) + 1;
        });

        const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
        const averageRating = testimonials.length > 0 ? totalRating / testimonials.length : 0;

        const topCompanies = Object.entries(companyCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([company]) => company);

        return {
          totalTestimonials: testimonials.length,
          featuredCount: testimonials.filter(t => t.featured).length,
          averageRating,
          ratingDistribution,
          topCompanies
        };
      })
    );
  }
}
