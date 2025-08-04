import { Component, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Experience as ExperienceEntity, Education } from '../../../domain/entities/experience.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { GetEducationsUseCase, GetEducationStatsUseCase } from '../../../domain/use-cases/education.use-case';
import { GetExperiencesUseCase } from '../../../domain/use-cases/experience.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-experience',
  imports: [CommonModule, RouterModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class Experience implements OnInit {
  private getProfileUseCase = inject(GetProfileUseCase);
  private getEducationsUseCase = inject(GetEducationsUseCase);
  private getEducationStatsUseCase = inject(GetEducationStatsUseCase);
  private getExperiencesUseCase = inject(GetExperiencesUseCase);
  private elementRef = inject(ElementRef);

  profile: Profile | null = null;
  experiences: ExperienceEntity[] = [];
  educations: Education[] = [];
  educationStats: any = null;
  experienceStats: any = null;
  allSkills: string[] = [];
  skillsWithExperience: { skill: string; count: number; years?: number }[] = [];
  isLoading = true;
  activeTimelineIndex = 0;
  hoveredSkill: string | null = null;

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
      // Load core data only once
      const [
        profileResult, 
        experiencesResult, 
        educationResult, 
        educationStatsResult
      ] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.getExperiencesUseCase.execute().toPromise(),
        this.getEducationsUseCase.execute().toPromise(),
        this.getEducationStatsUseCase.execute().toPromise()
      ]);

      this.profile = profileResult || null;
      this.experiences = experiencesResult || [];
      this.educations = educationResult || [];
      this.educationStats = educationStatsResult;

      // Calculate experience stats from loaded data (frontend processing)
      this.experienceStats = this.calculateExperienceStats(this.experiences);
      
      // Use skills from profile (centralized approach)
      this.allSkills = this.profile?.skills || [];
      
      // Calculate skills with experience count from loaded experiences (frontend processing)
      this.skillsWithExperience = this.calculateSkillsWithExperience(this.experiences, this.allSkills);

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
    return this.allSkills.length || 0;
  }

  // Frontend calculation methods to avoid redundant Firebase calls
  private calculateExperienceStats(experiences: ExperienceEntity[]): any {
    if (!experiences.length) {
      return {
        totalExperience: 0,
        totalCompanies: 0,
        totalAchievements: 0,
        yearsOfExperience: 0,
        totalSkills: 0
      };
    }

    const companies = new Set(experiences.map(exp => exp.company));
    const totalAchievements = experiences.reduce((sum, exp) => sum + (exp.achievements?.length || 0), 0);
    
    // Calculate total years of experience
    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      totalMonths += months;
    });

    const yearsOfExperience = totalMonths / 12;

    return {
      totalExperience: experiences.length,
      totalCompanies: companies.size,
      totalAchievements,
      yearsOfExperience,
      totalSkills: this.allSkills.length
    };
  }

  private calculateSkillsWithExperience(experiences: ExperienceEntity[], profileSkills: string[]): { skill: string; count: number; years?: number }[] {
    const skillStats = new Map<string, { count: number; totalMonths: number }>();

    // Initialize with profile skills
    profileSkills.forEach(skill => {
      skillStats.set(skill, { count: 0, totalMonths: 0 });
    });

    // Count usage in experiences
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

      (exp.technologies || []).forEach(tech => {
        if (skillStats.has(tech)) {
          const current = skillStats.get(tech)!;
          skillStats.set(tech, {
            count: current.count + 1,
            totalMonths: current.totalMonths + months
          });
        }
      });
    });

    // Convert to array format
    return Array.from(skillStats.entries()).map(([skill, stats]) => ({
      skill,
      count: stats.count,
      years: stats.totalMonths > 0 ? Math.round((stats.totalMonths / 12) * 10) / 10 : undefined
    }));
  }

  trackByExperience(index: number, experience: ExperienceEntity): string {
    return experience.id;
  }

  // ========================================
  // Enhanced Skills Tooltip Methods
  // ========================================

  showSkillTooltip(event: MouseEvent, skill: string): void {
    this.hoveredSkill = skill;
  }

  hideSkillTooltip(): void {
    this.hoveredSkill = null;
  }

  getSkillStats(skill: string): { skill: string; count: number; years?: number } | null {
    return this.skillsWithExperience.find(s => s.skill === skill) || null;
  }

  getSkillLevel(skill: string): string {
    const stats = this.getSkillStats(skill);
    if (!stats || !stats.years) return 'Learning';
    
    if (stats.years >= 3) return 'Expert';
    if (stats.years >= 1.5) return 'Advanced';
    if (stats.years >= 0.5) return 'Intermediate';
    return 'Beginner';
  }

  getSkillLevelClass(skill: string): string {
    const level = this.getSkillLevel(skill);
    return `skill-level-${level.toLowerCase()}`;
  }

  getSkillExperienceText(stats: { skill: string; count: number; years?: number }): string {
    if (!stats.years) {
      return stats.count > 0 ? 'Recently used' : 'Learning phase';
    }
    
    if (stats.years >= 3) return 'Highly experienced';
    if (stats.years >= 1.5) return 'Well experienced';
    if (stats.years >= 0.5) return 'Good experience';
    return 'Some experience';
  }

  getSkillProgressPercentage(stats: { skill: string; count: number; years?: number }): number {
    if (!stats.years) return 15;
    
    // Calculate percentage based on years (max 5 years = 100%)
    const maxYears = 5;
    const percentage = Math.min((stats.years / maxYears) * 100, 100);
    return Math.max(percentage, 15); // Minimum 15% for visibility
  }

  getSkillProgressText(stats: { skill: string; count: number; years?: number }): string {
    const percentage = this.getSkillProgressPercentage(stats);
    
    if (percentage >= 80) return 'Master level';
    if (percentage >= 60) return 'Expert level';
    if (percentage >= 40) return 'Advanced level';
    if (percentage >= 25) return 'Intermediate level';
    return 'Beginner level';
  }
}

