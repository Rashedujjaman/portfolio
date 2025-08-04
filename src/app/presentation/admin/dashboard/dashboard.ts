import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { GetExperiencesUseCase } from '../../../domain/use-cases/experience.use-case';
import { GetEducationsUseCase } from '../../../domain/use-cases/education.use-case';
import { GetTravelsUseCase, GetHobbiesUseCase } from '../../../domain/use-cases/lifestyle.use-case';
import { Project } from '../../../domain/entities/project.entity';
import { Profile } from '../../../domain/entities/profile.entity';
import { Experience, Education } from '../../../domain/entities/experience.entity';
import { Hobby, Travel } from '../../../domain/entities/lifestyle.entity';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  profile: Profile | null = null;
  projects: Project[] = [];
  experiences: Experience[] = [];
  educations: Education[] = [];
  travels: Travel[] = [];
  hobbies: Hobby[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private getProjectsUseCase: GetProjectsUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private getExperiencesUseCase: GetExperiencesUseCase,
    private getEducationsUseCase: GetEducationsUseCase,
    private getTravelsUseCase: GetTravelsUseCase,
    private getHobbiesUseCase: GetHobbiesUseCase
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    // Load profile data
    this.getProfileUseCase.execute().subscribe({
      next: (profile) => {
        this.profile = profile;
        console.log('Profile loaded:', profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });

    // Load projects data
    this.getProjectsUseCase.execute().subscribe({
      next: (projects) => {
        this.projects = projects;
        console.log('Projects loaded:', projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });

    // Load experiences data
    this.getExperiencesUseCase.execute().subscribe({
      next: (experiences) => {
        this.experiences = experiences;
        console.log('Experiences loaded:', experiences);
      },
      error: (error) => {
        console.error('Error loading experiences:', error);
      }
    });

    // Load educations data
    this.getEducationsUseCase.execute().subscribe({
      next: (educations) => {
        this.educations = educations;
        this.isLoading = false;
        console.log('Educations loaded:', educations);
      },
      error: (error) => {
        console.error('Error loading educations:', error);
        this.isLoading = false;
      }
    });

    //Load travels data
    this.getTravelsUseCase.execute().subscribe({
      next: (travels) => {
        this.travels = travels;
        console.log('Travels loaded:', travels);
      },
      error: (error) => {
        console.error('Error loading travels:', error);
      }
    });

    // Load hobbies data
    this.getHobbiesUseCase.execute().subscribe({
      next: (hobbies) => {
        this.hobbies = hobbies;
        console.log('Hobbies loaded:', hobbies);
      },
      error: (error) => {
        console.error('Error loading hobbies:', error);
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  navigateToProjects() {
    this.router.navigate(['/admin/projects']);
  }

  navigateToProfile() {
    this.router.navigate(['/admin/profile']);
  }

  navigateToExperience() {
    this.router.navigate(['/admin/experience']);
  }

  navigateToEducation() {
    this.router.navigate(['/admin/education']);
  }

  navigateToTravels() {
    this.router.navigate(['/admin/travel']);
  }

  getFeaturedProjectsCount(): number {
    return this.projects.filter(project => project.featured).length;
  }

  getRecentActivityCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.projects.filter(project => 
      new Date(project.updatedAt) > oneWeekAgo
    ).length;
  }

  getCurrentExperienceCount(): number {
    return this.experiences.filter(exp => exp.current).length;
  }

  getCurrentTravelCount(): number {
    return this.travels.filter(travel => travel.featured).length;
  }

  getTotalExperienceYears(): number {
    if (this.experiences.length === 0) return 0;
    
    const totalMonths = this.experiences.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return total + diffMonths;
    }, 0);
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  }
}
