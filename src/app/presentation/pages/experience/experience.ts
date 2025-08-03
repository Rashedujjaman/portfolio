import { Component, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Experience as ExperienceEntity, Education } from '../../../domain/entities/experience.entity';
import { ExperienceRepository } from '../../../domain/repositories/experience.repository';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-experience',
  imports: [CommonModule, RouterModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class Experience implements OnInit {
  private experienceRepository = inject(ExperienceRepository);
  private getProfileUseCase = inject(GetProfileUseCase);
  private elementRef = inject(ElementRef);

  profile: Profile | null = null;
  experiences: ExperienceEntity[] = [];
  education: Education[] = [];
  isLoading = true;
  activeTimelineIndex = 0;

  ngOnInit() {
    this.loadData();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateActiveTimeline();
    this.updateParallaxEffect();
  }

  private async loadData() {
    try {
      const [profileResult, experiencesResult] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.experienceRepository.getExperiences().toPromise()
      ]);

      this.profile = profileResult || null;
      this.experiences = experiencesResult || [];
      // Note: Education data will be added when repository method is implemented
      this.education = [];
    } catch (error) {
      console.error('Error loading experience data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateActiveTimeline() {
    const timelineItems = this.elementRef.nativeElement.querySelectorAll('.timeline-item');
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    timelineItems.forEach((item: HTMLElement, index: number) => {
      const rect = item.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      
      if (scrollY + windowHeight / 2 >= elementTop) {
        this.activeTimelineIndex = index;
      }
    });
  }

  private updateParallaxEffect() {
    const scrolled = window.pageYOffset;
    const parallaxElements = this.elementRef.nativeElement.querySelectorAll('.parallax-element');
    
    parallaxElements.forEach((element: HTMLElement, index: number) => {
      const speed = 0.1 + (index * 0.05);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  getExperienceIcon(company: string): string {
    // Map company names to icons
    const iconMap: { [key: string]: string } = {
      'microsoft': '🏢',
      'google': '🔍',
      'amazon': '📦',
      'apple': '🍎',
      'meta': '👥',
      'netflix': '🎬',
      'spotify': '🎵',
      'uber': '🚗',
      'airbnb': '🏠',
      'default': '💼'
    };

    const lowerCompany = company.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerCompany.includes(key)) {
        return icon;
      }
    }
    return iconMap['default'];
  }

  getEducationIcon(degree: string): string {
    const degreeType = degree.toLowerCase();
    if (degreeType.includes('phd') || degreeType.includes('doctorate')) return '🎓';
    if (degreeType.includes('master') || degreeType.includes('msc') || degreeType.includes('mba')) return '🎓';
    if (degreeType.includes('bachelor') || degreeType.includes('bsc') || degreeType.includes('ba')) return '📚';
    if (degreeType.includes('diploma') || degreeType.includes('certificate')) return '📜';
    return '🎓';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }).format(new Date(date));
  }

  calculateDuration(startDate: Date, endDate?: Date): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''}`;
    }
  }

  getTotalExperience(): string {
    if (this.experiences.length === 0) return '0';
    
    let totalMonths = 0;
    this.experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      totalMonths += months;
    });
    
    const years = Math.floor(totalMonths / 12);
    return years.toString();
  }

  trackByExperience(index: number, experience: ExperienceEntity): string {
    return experience.id;
  }
}

