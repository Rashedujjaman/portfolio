import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
import { Project } from '../../../domain/entities/project.entity';
import { ProjectRepositoryImpl } from '../../../data/repositories/project-repository.impl';

@Component({
  selector: 'app-admin-projects',
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss']
})
export class AdminProjects implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;
  
  // Filters
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  
  // Status
  statusMessage = '';
  hasError = false;

  constructor(
    private router: Router,
    private getProjectsUseCase: GetProjectsUseCase,
    private projectRepository: ProjectRepositoryImpl
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.getProjectsUseCase.execute().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
        this.showError('Error loading projects. Please try again.');
      }
    });
  }

  filterProjects() {
    let filtered = [...this.projects];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.shortDescription.toLowerCase().includes(term) ||
        project.technologies.some(tech => tech.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(project => project.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(project => project.category === this.categoryFilter);
    }

    this.filteredProjects = filtered;
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.categoryFilter);
  }

  createProject() {
    this.router.navigate(['/admin/projects/edit/new']);
  }

  editProject(project: Project) {
    this.router.navigate(['/admin/projects/edit', project.id]);
  }

  toggleFeatured(project: Project) {
    const projectData = {
      featured: !project.featured,
      updatedAt: new Date()
    };

    this.projectRepository.updateProject(project.id, projectData).subscribe({
      next: () => {
        this.showSuccess(`Project ${!project.featured ? 'added to' : 'removed from'} featured list!`);
        this.loadProjects();
      },
      error: (error: any) => {
        this.showError(`Error updating project: ${error.message}`);
      }
    });
  }

  deleteProject(project: Project) {
    if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      this.projectRepository.deleteProject(project.id).subscribe({
        next: () => {
          this.showSuccess('Project deleted successfully!');
          this.loadProjects();
        },
        error: (error: any) => {
          this.showError(`Error deleting project: ${error.message}`);
        }
      });
    }
  }

  // Status messages
  private showError(message: string) {
    this.hasError = true;
    this.statusMessage = message;
    setTimeout(() => {
      this.statusMessage = '';
      this.hasError = false;
    }, 5000);
  }

  private showSuccess(message: string) {
    this.hasError = false;
    this.statusMessage = message;
    setTimeout(() => {
      this.statusMessage = '';
    }, 3000);
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
