import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetExperiencesUseCase, DeleteExperienceUseCase } from '../../../domain/use-cases/experience.use-case';
import { Experience } from '../../../domain/entities/experience.entity';

@Component({
  selector: 'app-admin-experience',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class AdminExperience implements OnInit {
  experiences: Experience[] = [];
  isLoading = true;
  deleteDialogVisible = false;
  experienceToDelete: Experience | null = null;
  isDeleting = false;

  constructor(
    private getExperiencesUseCase: GetExperiencesUseCase,
    private deleteExperienceUseCase: DeleteExperienceUseCase,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadExperiences();
  }

  private loadExperiences() {
    this.isLoading = true;
    this.getExperiencesUseCase.execute().subscribe({
      next: (experiences) => {
        this.experiences = experiences.sort((a, b) => {
          // Current experience first, then by start date descending
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading experiences:', error);
        this.isLoading = false;
      }
    });
  }

  createExperience() {
    this.router.navigate(['/admin/experience/new']);
  }

  editExperience(experience: Experience) {
    this.router.navigate(['/admin/experience/edit', experience.id]);
  }

  confirmDelete(experience: Experience) {
    this.experienceToDelete = experience;
    this.deleteDialogVisible = true;
  }

  cancelDelete() {
    this.deleteDialogVisible = false;
    this.experienceToDelete = null;
  }

  deleteExperience() {
    if (!this.experienceToDelete) return;

    this.isDeleting = true;
    this.deleteExperienceUseCase.execute(this.experienceToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteDialogVisible = false;
        this.experienceToDelete = null;
        this.loadExperiences(); // Reload the list
      },
      error: (error) => {
        console.error('Error deleting experience:', error);
        this.isDeleting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  formatDateRange(experience: Experience): string {
    const startDate = new Date(experience.startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (experience.current) {
      return `${startDate} - Present`;
    }
    
    const endDate = experience.endDate 
      ? new Date(experience.endDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
      : 'Present';
    
    return `${startDate} - ${endDate}`;
  }

  getDuration(experience: Experience): string {
    const start = new Date(experience.startDate);
    const end = experience.current || !experience.endDate 
      ? new Date() 
      : new Date(experience.endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
}
