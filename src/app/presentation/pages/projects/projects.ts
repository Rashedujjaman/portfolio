import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
import { Project, ProjectCategory, ProjectStatus } from '../../../domain/entities/project.entity';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {
  projects: Project[] = [];
  featuredProjects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;
  
  // Slideshow tracking
  currentSlides: { [key: number]: number } = {};
  
  // Filters
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';
  
  // Categories for filtering
  categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'web-application', label: 'Web Apps' },
    { value: 'mobile-app', label: 'Mobile Apps' },
    { value: 'desktop-app', label: 'Desktop Apps' },
    { value: 'api', label: 'APIs' },
    { value: 'library', label: 'Libraries' },
    { value: 'other', label: 'Other' }
  ];

  constructor(private getProjectsUseCase: GetProjectsUseCase) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.getProjectsUseCase.execute().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.featuredProjects = projects.filter(p => p.featured);
        this.filteredProjects = [...projects];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  filterProjects(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.projects];

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === this.selectedCategory);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === this.selectedStatus);
    }

    this.filteredProjects = filtered;
  }

  // Slideshow methods
  setActiveSlide(projectIndex: number, slideIndex: number) {
    this.currentSlides[projectIndex] = slideIndex;
    this.updateSlideDisplay(projectIndex, slideIndex);
  }

  previousSlide(projectIndex: number) {
    const project = this.filteredProjects[projectIndex];
    if (!project.images || project.images.length <= 1) return;
    
    const currentSlide = this.currentSlides[projectIndex] || 0;
    const newSlide = currentSlide === 0 ? project.images.length - 1 : currentSlide - 1;
    this.setActiveSlide(projectIndex, newSlide);
  }

  nextSlide(projectIndex: number) {
    const project = this.filteredProjects[projectIndex];
    if (!project.images || project.images.length <= 1) return;
    
    const currentSlide = this.currentSlides[projectIndex] || 0;
    const newSlide = currentSlide === project.images.length - 1 ? 0 : currentSlide + 1;
    this.setActiveSlide(projectIndex, newSlide);
  }

  private updateSlideDisplay(projectIndex: number, activeSlideIndex: number) {
    // This method would update the DOM to show the active slide
    // For simplicity, we'll handle this with CSS classes
    setTimeout(() => {
      const slideContainer = document.querySelectorAll('.image-slideshow')[projectIndex];
      if (slideContainer) {
        const slides = slideContainer.querySelectorAll('.slide-image');
        const indicators = slideContainer.querySelectorAll('.indicator, .slide-dot');
        
        slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === activeSlideIndex);
        });
        
        indicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === activeSlideIndex);
        });
      }
    });
  }

  getCompletedProjectsCount(): number {
    return this.projects.filter(p => p.status === 'completed').length;
  }

  getStatusLabel(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'Completed';
      case ProjectStatus.IN_PROGRESS:
        return 'In Progress';
      case ProjectStatus.PLANNED:
        return 'Planned';
      case ProjectStatus.ARCHIVED:
        return 'Archived';
      default:
        return status;
    }
  }

  getCategoryLabel(category: ProjectCategory): string {
    switch (category) {
      case ProjectCategory.WEB_APPLICATION:
        return 'Web Application';
      case ProjectCategory.MOBILE_APP:
        return 'Mobile App';
      case ProjectCategory.DESKTOP_APP:
        return 'Desktop App';
      case ProjectCategory.API:
        return 'API';
      case ProjectCategory.LIBRARY:
        return 'Library';
      case ProjectCategory.OTHER:
        return 'Other';
      default:
        return category;
    }
  }
}
