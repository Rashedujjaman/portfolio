import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GetProjectsUseCase, CreateProjectUseCase, UpdateProjectUseCase } from '../../../domain/use-cases/project.use-case';
import { Project, ProjectStatus, ProjectCategory } from '../../../domain/entities/project.entity';
import { ProjectRepositoryImpl } from '../../../data/repositories/project-repository.impl';

@Component({
  selector: 'app-admin-projects',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss']
})
export class AdminProjects implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;
  isSaving = false;
  
  // Filters
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  
  // Modal
  showEditModal = false;
  editingProject: Project | null = null;
  projectForm: FormGroup;
  
  // Image upload state
  uploadingImages = false;
  uploadProgress: { [key: string]: number } = {};
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  
  // Status
  statusMessage = '';
  hasError = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private getProjectsUseCase: GetProjectsUseCase,
    private createProjectUseCase: CreateProjectUseCase,
    private updateProjectUseCase: UpdateProjectUseCase,
    private projectRepository: ProjectRepositoryImpl
  ) {
    this.projectForm = this.createForm();
  }

  ngOnInit() {
    this.loadProjects();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      shortDescription: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      status: ['in-progress', [Validators.required]],
      technologiesInput: [''],
      demoUrl: [''],
      githubUrl: [''],
      featured: [false]
    });
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
    this.editingProject = null;
    this.projectForm.reset();
    this.projectForm.patchValue({
      status: 'in-progress',
      featured: false
    });
    this.clearImageState();
    this.showEditModal = true;
  }

  editProject(project: Project) {
    this.editingProject = project;
    this.populateForm(project);
    this.loadExistingImages(project.images);
    this.showEditModal = true;
  }

  private populateForm(project: Project) {
    this.projectForm.patchValue({
      title: project.title,
      shortDescription: project.shortDescription,
      description: project.description,
      category: project.category,
      status: project.status,
      technologiesInput: project.technologies.join(', '),
      demoUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      featured: project.featured
    });
  }

  saveProject() {
    if (this.projectForm.valid) {
      this.isSaving = true;
      const formValue = this.projectForm.value;

      const projectData: Partial<Project> = {
        title: formValue.title,
        shortDescription: formValue.shortDescription,
        description: formValue.description,
        category: formValue.category as ProjectCategory,
        status: formValue.status as ProjectStatus,
        technologies: formValue.technologiesInput
          ? formValue.technologiesInput.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech)
          : [],
        featured: formValue.featured,
        images: this.editingProject?.images || []
      };

      // Only add optional fields if they have values
      if (formValue.demoUrl) {
        projectData.liveUrl = formValue.demoUrl;
      }
      if (formValue.githubUrl) {
        projectData.githubUrl = formValue.githubUrl;
      }

      if (this.editingProject) {
        // Update existing project
        const updateData = {
          ...projectData,
          updatedAt: new Date()
        };

        this.updateProjectUseCase.execute(this.editingProject.id, updateData).subscribe({
          next: () => {
            this.isSaving = false;
            this.showSuccess('Project updated successfully!');
            this.closeEditModal();
            this.loadProjects();
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError(`Error updating project: ${error.message}`);
          }
        });
      } else {
        // Create new project
        const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
          title: projectData.title!,
          shortDescription: projectData.shortDescription!,
          description: projectData.description!,
          category: projectData.category!,
          status: projectData.status!,
          technologies: projectData.technologies || [],
          liveUrl: projectData.liveUrl,
          githubUrl: projectData.githubUrl,
          featured: projectData.featured!,
          images: [],
          startDate: new Date()
        };

        this.createProjectUseCase.execute(newProject).subscribe({
          next: () => {
            this.isSaving = false;
            this.showSuccess('Project created successfully!');
            this.closeEditModal();
            this.loadProjects();
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError(`Error creating project: ${error.message}`);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
    }
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

  closeEditModal() {
    this.showEditModal = false;
    this.editingProject = null;
    this.projectForm.reset();
    this.clearImageState();
  }

  // Image Management Methods
  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => this.validateImageFile(file));
    if (validFiles.length !== files.length) {
      this.showError('Some files were rejected. Please select valid image files (JPG, PNG, GIF, WebP) under 5MB each.');
    }

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    this.generatePreviewUrls();
  }

  private validateImageFile(file: File): boolean {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return false;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return false;
    }

    return true;
  }

  private generatePreviewUrls() {
    // Clear existing preview URLs
    this.previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // Generate new preview URLs
    this.previewUrls = this.selectedFiles.map(file => URL.createObjectURL(file));
  }

  removeImage(index: number) {
    if (this.previewUrls[index] && this.previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrls[index]);
    }
    
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  private clearImageState() {
    // Clean up blob URLs
    this.previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    this.selectedFiles = [];
    this.previewUrls = [];
    this.uploadingImages = false;
    this.uploadProgress = {};
  }

  private loadExistingImages(imageUrls: string[]) {
    this.clearImageState();
    this.previewUrls = [...imageUrls];
  }

  private async uploadImages(): Promise<string[]> {
    if (this.selectedFiles.length === 0) {
      return this.editingProject?.images || [];
    }

    this.uploadingImages = true;
    const uploadedUrls: string[] = [];

    try {
      // For now, we'll simulate image upload since we don't have Firebase Storage setup
      // In a real implementation, you would upload to Firebase Storage
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        this.uploadProgress[file.name] = 0;

        // Simulate upload progress
        const uploadPromise = this.simulateUpload(file);
        const uploadedUrl = await uploadPromise;
        uploadedUrls.push(uploadedUrl);
      }

      // Combine existing images with new uploads
      const existingImages = this.editingProject?.images || [];
      const newImageUrls = this.previewUrls.filter(url => !url.startsWith('blob:'));
      
      return [...existingImages, ...newImageUrls, ...uploadedUrls];
    } catch (error) {
      throw new Error(`Image upload failed: ${error}`);
    } finally {
      this.uploadingImages = false;
    }
  }

  private simulateUpload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        this.uploadProgress[file.name] = progress;

        if (progress >= 100) {
          clearInterval(interval);
          // For demo purposes, we'll use the blob URL as the "uploaded" URL
          // In real implementation, this would be the Firebase Storage URL
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  }

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
