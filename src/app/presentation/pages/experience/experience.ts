import { Component, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Experience as ExperienceEntity, Education } from '../../../domain/entities/experience.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { GetEducationUseCase, GetEducationStatsUseCase } from '../../../domain/use-cases/education.use-case';
import { 
  GetExperiencesUseCase, 
  GetAllSkillsUseCase, 
  GetSkillsWithExperienceUseCase,
  GetExperienceStatsUseCase 
} from '../../../domain/use-cases/experience.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-experience',
  imports: [CommonModule, RouterModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class Experience implements OnInit {
  private getProfileUseCase = inject(GetProfileUseCase);
  private getEducationUseCase = inject(GetEducationUseCase);
  private getEducationStatsUseCase = inject(GetEducationStatsUseCase);
  private getExperiencesUseCase = inject(GetExperiencesUseCase);
  private getAllSkillsUseCase = inject(GetAllSkillsUseCase);
  private getSkillsWithExperienceUseCase = inject(GetSkillsWithExperienceUseCase);
  private getExperienceStatsUseCase = inject(GetExperienceStatsUseCase);
  private elementRef = inject(ElementRef);

  profile: Profile | null = null;
  experiences: ExperienceEntity[] = [];
  education: Education[] = [];
  educationStats: any = null;
  experienceStats: any = null;
  allSkills: string[] = [];
  skillsWithExperience: { skill: string; count: number; years?: number }[] = [];
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
      const [
        profileResult, 
        experiencesResult, 
        educationResult, 
        educationStatsResult,
        experienceStatsResult,
        allSkillsResult,
        skillsWithExperienceResult
      ] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.getExperiencesUseCase.execute().toPromise(),
        this.getEducationUseCase.execute().toPromise(),
        this.getEducationStatsUseCase.execute().toPromise(),
        this.getExperienceStatsUseCase.execute().toPromise(),
        this.getAllSkillsUseCase.execute().toPromise(),
        this.getSkillsWithExperienceUseCase.execute().toPromise()
      ]);

      this.profile = profileResult || null;
      this.experiences = experiencesResult || [];
      this.education = educationResult || [];
      this.educationStats = educationStatsResult;
      this.experienceStats = experienceStatsResult;
      this.allSkills = allSkillsResult || [];
      this.skillsWithExperience = skillsWithExperienceResult || [];

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

  formatDate(date: Date | any): string {
    if (!date) return 'N/A';
    
    let dateObj: Date;
    
    // Handle Firebase Timestamp objects
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date received:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }).format(dateObj);
  }

  calculateDuration(startDate: Date | any, endDate?: Date | any): string {
    if (!startDate) return 'N/A';
    
    let start: Date, end: Date;
    
    // Handle Firebase Timestamp objects for startDate
    if (startDate && typeof startDate.toDate === 'function') {
      start = startDate.toDate();
    } else if (startDate instanceof Date) {
      start = startDate;
    } else {
      start = new Date(startDate);
    }
    
    // Handle Firebase Timestamp objects for endDate
    if (endDate) {
      if (endDate && typeof endDate.toDate === 'function') {
        end = endDate.toDate();
      } else if (endDate instanceof Date) {
        end = endDate;
      } else {
        end = new Date(endDate);
      }
    } else {
      end = new Date();
    }
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid dates received:', { startDate, endDate });
      return 'Invalid Duration';
    }
    
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
    if (this.experienceStats?.yearsOfExperience) {
      return Math.floor(this.experienceStats.yearsOfExperience).toString();
    }
    
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

  getTotalSkills(): number {
    return this.experienceStats?.totalSkills || this.allSkills.length || 0;
  }

  trackByExperience(index: number, experience: ExperienceEntity): string {
    return experience.id;
  }
}

