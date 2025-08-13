import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../../../domain/entities/profile.entity';
import { Project } from '../../../domain/entities/project.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
// import { DataSeedingService } from '../../../core/data-seeding-enhanced.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profile: Profile | null = null;
  featuredProjects: Project[] = [];
  isLoadingProfile = true;
  isLoadingProjects = true;

  constructor(
    private getProfileUseCase: GetProfileUseCase,
    private getProjectsUseCase: GetProjectsUseCase,
    private elementRef: ElementRef,
    // private dataSeedingService: DataSeedingService
  ) {}

  ngOnInit() {
    this.seedDataAndLoad();
    this.initializeInteractiveEffects();
  }

  private async seedDataAndLoad() {
    try {
      // Seed data first to ensure we have experience data for skills
      // await this.dataSeedingService.seedAllData();
      
      this.loadProfile();
      this.loadFeaturedProjects();
    } catch (error) {
      console.error('Error seeding data or loading content:', error);
      // Continue with loading even if seeding fails
      this.loadProfile();
      this.loadFeaturedProjects();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.updateParallaxEffects(event);
  }

  private initializeInteractiveEffects() {
    // Add smooth entrance animations
    setTimeout(() => {
      const heroContent = this.elementRef.nativeElement.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.animation = 'fadeInUp 1s ease-out forwards';
      }
    }, 100);
  }

  private updateParallaxEffects(event: MouseEvent) {
    const heroSection = this.elementRef.nativeElement.querySelector('.hero-section');
    if (!heroSection) return;

    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const deltaX = (mouseX - centerX) / centerX;
    const deltaY = (mouseY - centerY) / centerY;

    // Apply parallax to floating shapes
    const shapes = this.elementRef.nativeElement.querySelectorAll('.shape');
    shapes.forEach((shape: HTMLElement, index: number) => {
      const speed = (index % 3 + 1) * 0.5;
      const x = deltaX * speed * 10;
      const y = deltaY * speed * 10;
      shape.style.transform += ` translate(${x}px, ${y}px)`;
    });

    // Apply parallax to tech icons
    const techIcons = this.elementRef.nativeElement.querySelectorAll('.tech-icon');
    techIcons.forEach((icon: HTMLElement, index: number) => {
      const speed = (index % 2 + 1) * 0.3;
      const x = deltaX * speed * 15;
      const y = deltaY * speed * 15;
      icon.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Apply subtle rotation to gradient orbs
    const orbs = this.elementRef.nativeElement.querySelectorAll('.orb');
    orbs.forEach((orb: HTMLElement, index: number) => {
      const rotation = deltaX * (index + 1) * 2;
      orb.style.transform += ` rotate(${rotation}deg)`;
    });
  }

  private loadProfile() {
    this.getProfileUseCase.execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoadingProfile = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoadingProfile = false;
        }
      });
  }

  private loadFeaturedProjects() {
    this.getProjectsUseCase.execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.featuredProjects = projects.filter(project => project.featured).slice(0, 3);
          this.isLoadingProjects = false;
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.isLoadingProjects = false;
        }
      });
  }

  // Utility methods for social links
  getSocialLink(platform: string): string {
    if (!this.profile?.socialLinks) return '';
    const link = this.profile.socialLinks.find(sl => sl.platform.toLowerCase() === platform.toLowerCase());
    return link?.url || '';
  }

  getSocialIcon(platform: string): string {
    const iconMap: { [key: string]: string } = {
      'linkedin': '💼',
      'github': '💻',
      'twitter': '🐦',
      'facebook': '📘',
      'instagram': '📷',
      'website': '🌐',
      'youtube': '📺',
      'email': '✉️'
    };
    return iconMap[platform.toLowerCase()] || '🔗';
  }

  hasSocialLinks(): boolean {
    return !!(this.profile?.socialLinks && this.profile.socialLinks.length > 0);
  }

  get isLoading(): boolean {
    return this.isLoadingProfile || this.isLoadingProjects;
  }

  isWebCategory(project: Project): boolean {
    return project.category === 'web-application' || (project as any).category === 'web-application';
  }
}
