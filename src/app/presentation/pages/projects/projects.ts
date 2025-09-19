import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
import {
  Project,
  ProjectCategory,
  ProjectStatus,
} from '../../../domain/entities/project.entity';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit, OnDestroy {
  projects: Project[] = [];
  featuredProjects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;

  // Slideshow tracking
  currentSlides: { [key: number]: number } = {};

  // Image layout detection
  imageLayouts: { [key: string]: string } = {};

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
    { value: 'other', label: 'Other' },
  ];

  private getProjectsUseCase = inject(GetProjectsUseCase);

  private autoSlideDelay = 5000; // 5s per slide
  private slideIntervals: { [key: number]: any } = {};
  dotDisplayLimit = 12;

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    Object.values(this.slideIntervals).forEach((id) => clearInterval(id));
  }

  private loadProjects() {
    this.getProjectsUseCase.execute().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.featuredProjects = projects.filter((p) => p.featured);
        this.filteredProjects = [...projects];
        this.isLoading = false;
        this.initializeAutoSlides();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      },
    });
  }

  private initializeAutoSlides() {
    this.filteredProjects.forEach((p, idx) => {
      if (p.images && p.images.length > 1) {
        this.startAutoSlide(idx);
      }
    });
  }

  private startAutoSlide(projectIndex: number) {
    this.clearAutoSlide(projectIndex);
    this.slideIntervals[projectIndex] = setInterval(() => {
      this.nextSlide(projectIndex, true);
    }, this.autoSlideDelay);
  }

  private clearAutoSlide(projectIndex: number) {
    if (this.slideIntervals[projectIndex]) {
      clearInterval(this.slideIntervals[projectIndex]);
      delete this.slideIntervals[projectIndex];
    }
  }

  pauseAutoSlide(projectIndex: number) {
    this.clearAutoSlide(projectIndex);
  }

  resumeAutoSlide(projectIndex: number) {
    const project = this.filteredProjects[projectIndex];
    if (project?.images?.length > 1) this.startAutoSlide(projectIndex);
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
      filtered = filtered.filter(
        (project) => project.category === this.selectedCategory
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(
        (project) => project.status === this.selectedStatus
      );
    }

    this.filteredProjects = filtered;

    // restart intervals after filtering
    Object.values(this.slideIntervals).forEach((id) => clearInterval(id));
    this.slideIntervals = {};
    this.initializeAutoSlides();
  }

  // Slideshow methods
  setActiveSlide(projectIndex: number, slideIndex: number) {
    this.currentSlides[projectIndex] = slideIndex;
  }

  previousSlide(projectIndex: number, silent?: boolean) {
    const project = this.filteredProjects[projectIndex];
    if (!project?.images || project.images.length <= 1) return;

    const currentSlide = this.currentSlides[projectIndex] ?? 0;
    const newSlide =
      currentSlide === 0 ? project.images.length - 1 : currentSlide - 1;
    this.setActiveSlide(projectIndex, newSlide);
    if (!silent) this.restartSlideTimer(projectIndex);
  }

  nextSlide(projectIndex: number, silent?: boolean) {
    const project = this.filteredProjects[projectIndex];
    if (!project?.images || project.images.length <= 1) return;

    const currentSlide = this.currentSlides[projectIndex] ?? 0;
    const newSlide =
      currentSlide === project.images.length - 1 ? 0 : currentSlide + 1;
    this.setActiveSlide(projectIndex, newSlide);
    if (!silent) this.restartSlideTimer(projectIndex);
  }

  private restartSlideTimer(projectIndex: number) {
    this.startAutoSlide(projectIndex);
  }

  getSlideProgress(projectIndex: number, project: Project): number {
    const total = project.images?.length || 1;
    const current = (this.currentSlides[projectIndex] ?? 0) + 1;
    return (current / total) * 100;
  }

  shouldShowDots(project: Project): boolean {
    return (
      !!project.images &&
      project.images.length > 1 &&
      project.images.length <= this.dotDisplayLimit
    );
  }

  shouldShowProgressBar(project: Project): boolean {
    return !!project.images && project.images.length > this.dotDisplayLimit;
  }

  // Image layout detection methods
  detectImageLayout(project: Project): string {
    // Check if we already determined the layout for this project
    if (this.imageLayouts[project.id]) {
      return this.imageLayouts[project.id];
    }

    // Default to adaptive layout
    let detectedLayout = 'adaptive-layout';

    // Check project category first
    if (project.category === ProjectCategory.MOBILE_APP) {
      detectedLayout = 'mobile-layout';
    } else if (project.category === ProjectCategory.WEB_APPLICATION) {
      detectedLayout = 'web-layout';
    }

    // Store the detected layout
    this.imageLayouts[project.id] = detectedLayout;
    return detectedLayout;
  }

  getImageClass(project: Project): string {
    const layout = this.detectImageLayout(project);

    switch (layout) {
      case 'mobile-layout':
        return 'mobile-image';
      case 'web-layout':
        return 'web-image';
      default:
        return 'adaptive-image';
    }
  }

  onImageLoad(event: Event, project: Project) {
    const img = event.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Determine layout based on aspect ratio
    let layout: string;
    if (aspectRatio < 0.8) {
      // Portrait/mobile images (height > width)
      layout = 'mobile-layout';
    } else if (aspectRatio > 1.5) {
      // Landscape/web images (width significantly > height)
      layout = 'web-layout';
    } else {
      // Square-ish images or adaptive
      layout = 'adaptive-layout';
    }

    // Update the stored layout
    this.imageLayouts[project.id] = layout;

    // Update the container class dynamically
    const container = img.closest(
      '.project-image-container, .card-image-container'
    );
    if (container) {
      container.classList.remove(
        'mobile-layout',
        'web-layout',
        'adaptive-layout'
      );
      container.classList.add(layout);
    }

    // For mobile layout, dynamically adjust device frame size
    if (layout === 'mobile-layout') {
      this.adjustDeviceFrameSize(img, project);
    }

    // Update image class
    img.classList.remove('mobile-image', 'web-image', 'adaptive-image');
    img.classList.add(this.getImageClass(project));

    img.classList.remove('is-portrait', 'is-landscape');
    if (aspectRatio < 0.9) {
      img.classList.add('is-portrait');
    } else {
      img.classList.add('is-landscape');
    }
  }

  private adjustDeviceFrameSize(img: HTMLImageElement, project: Project) {
    const deviceFrame = img.closest('.device-frame');
    if (!deviceFrame) return;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;

    // Constants for device frame padding
    const FRAME_PADDING_X = 24; // 12px left + 12px right
    const FRAME_PADDING_Y = 40; // 20px top + 20px bottom
    const MIN_FRAME_WIDTH = 200;
    const MAX_FRAME_WIDTH = 300;
    const MIN_FRAME_HEIGHT = 350;
    const MAX_FRAME_HEIGHT = 550;

    // For card containers (smaller)
    const isCard = img.closest('.card-image-container');
    const CARD_FRAME_PADDING_X = 16; // 8px left + 8px right
    const CARD_FRAME_PADDING_Y = 24; // 12px top + 12px bottom
    const CARD_MIN_FRAME_WIDTH = 120;
    const CARD_MAX_FRAME_WIDTH = 180;
    const CARD_MIN_FRAME_HEIGHT = 220;
    const CARD_MAX_FRAME_HEIGHT = 350;

    const paddingX = isCard ? CARD_FRAME_PADDING_X : FRAME_PADDING_X;
    const paddingY = isCard ? CARD_FRAME_PADDING_Y : FRAME_PADDING_Y;
    const minWidth = isCard ? CARD_MIN_FRAME_WIDTH : MIN_FRAME_WIDTH;
    const maxWidth = isCard ? CARD_MAX_FRAME_WIDTH : MAX_FRAME_WIDTH;
    const minHeight = isCard ? CARD_MIN_FRAME_HEIGHT : MIN_FRAME_HEIGHT;
    const maxHeight = isCard ? CARD_MAX_FRAME_HEIGHT : MAX_FRAME_HEIGHT;

    // Calculate optimal display size while maintaining aspect ratio
    let displayWidth, displayHeight;

    // Start with a base width and calculate height
    const baseDisplayWidth = isCard ? 140 : 220;
    displayWidth = baseDisplayWidth;
    displayHeight = displayWidth / aspectRatio;

    // Ensure we don't exceed maximum dimensions
    if (displayWidth > maxWidth - paddingX) {
      displayWidth = maxWidth - paddingX;
      displayHeight = displayWidth / aspectRatio;
    }

    if (displayHeight > maxHeight - paddingY) {
      displayHeight = maxHeight - paddingY;
      displayWidth = displayHeight * aspectRatio;
    }

    // Ensure we meet minimum dimensions
    if (displayWidth < minWidth - paddingX) {
      displayWidth = minWidth - paddingX;
      displayHeight = displayWidth / aspectRatio;
    }

    if (displayHeight < minHeight - paddingY) {
      displayHeight = minHeight - paddingY;
      displayWidth = displayHeight * aspectRatio;
    }

    // Apply the calculated frame size
    const frameWidth = Math.round(displayWidth + paddingX);
    const frameHeight = Math.round(displayHeight + paddingY);

    (deviceFrame as HTMLElement).style.width = `${frameWidth}px`;
    (deviceFrame as HTMLElement).style.height = `${frameHeight}px`;

    // Update image size to fit within the frame
    img.style.maxWidth = `${displayWidth}px`;
    img.style.maxHeight = `${displayHeight}px`;
  }

  private updateSlideDisplay(projectIndex: number, activeSlideIndex: number) {
    // This method would update the DOM to show the active slide
    // For simplicity, we'll handle this with CSS classes
    setTimeout(() => {
      const slideContainer =
        document.querySelectorAll('.image-slideshow')[projectIndex];
      if (slideContainer) {
        const slides = slideContainer.querySelectorAll('.slide-image');
        const indicators = slideContainer.querySelectorAll(
          '.indicator, .slide-dot'
        );

        slides.forEach((slide, index) => {
          slide.classList.toggle('active', index === activeSlideIndex);

          // For mobile images, adjust frame size when slide becomes active
          if (
            index === activeSlideIndex &&
            slide.classList.contains('mobile-image')
          ) {
            const project =
              this.filteredProjects[projectIndex] ||
              this.featuredProjects[projectIndex];
            if (project) {
              this.adjustDeviceFrameSize(slide as HTMLImageElement, project);
            }
          }
        });

        indicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === activeSlideIndex);
        });
      }
    });
  }

  getCompletedProjectsCount(): number {
    return this.projects.filter((p) => p.status === 'completed').length;
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

  getCategoryClass(category: ProjectCategory): string {
    switch (category) {
      case ProjectCategory.MOBILE_APP:
        return 'mobile';
      case ProjectCategory.WEB_APPLICATION:
        return 'web';
      case ProjectCategory.DESKTOP_APP:
        return 'desktop';
      case ProjectCategory.API:
        return 'api';
      default:
        return 'web';
    }
  }

  getStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'completed';
      case ProjectStatus.IN_PROGRESS:
        return 'in-progress';
      case ProjectStatus.PLANNED:
        return 'planned';
      default:
        return 'completed';
    }
  }
}
