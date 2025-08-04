import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetProjectsUseCase, CreateProjectUseCase, UpdateProjectUseCase } from '../../../../domain/use-cases/project.use-case';
import { Project, ProjectStatus, ProjectCategory } from '../../../../domain/entities/project.entity';
import { ProjectRepositoryImpl } from '../../../../data/repositories/project-repository.impl';
import { StorageService } from '../../../../core/storage.service';

interface ImageState {
  url: string;
  isNew: boolean;
  file?: File;
  isDeleted?: boolean;
  isUploaded?: boolean;
}

@Component({
  selector: 'app-project-edit',
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './project-edit.html',
  styleUrls: ['./project-edit.scss']
})
export class ProjectEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  projectForm: FormGroup;
  project: Project | null = null;
  isNewProject = true;
  isSaving = false;
  isLoading = false;
  
  // Image management with transaction safety
  imageStates: ImageState[] = [];
  uploadingImages = false;
  uploadProgress: { [key: string]: number } = {};
  pendingUploads: string[] = []; // Track uploaded URLs for potential rollback
  
  // Status
  statusMessage = '';
  hasError = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private getProjectsUseCase: GetProjectsUseCase,
    private createProjectUseCase: CreateProjectUseCase,
    private updateProjectUseCase: UpdateProjectUseCase,
    private projectRepository: ProjectRepositoryImpl,
    private storageService: StorageService
  ) {
    this.projectForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isNewProject = false;
        this.loadProject(params['id']);
      } else {
        this.isNewProject = true;
        this.initializeNewProject();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupBlobUrls();
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

  private initializeNewProject() {
    this.projectForm.patchValue({
      status: 'in-progress',
      featured: false
    });
    this.imageStates = [];
  }

  private loadProject(id: string) {
    this.isLoading = true;
    this.getProjectsUseCase.execute().pipe(takeUntil(this.destroy$)).subscribe({
      next: (projects) => {
        this.project = projects.find(p => p.id === id) || null;
        if (this.project) {
          this.populateForm(this.project);
          this.initializeImageStates(this.project.images);
        } else {
          this.showError('Project not found');
          this.goBack();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.showError('Error loading project');
        this.isLoading = false;
      }
    });
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

  private initializeImageStates(imageUrls: string[]) {
    this.imageStates = imageUrls.map(url => ({
      url,
      isNew: false,
      isUploaded: true
    }));
  }

  // File Selection and Management
  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => this.validateImageFile(file));
    if (validFiles.length !== files.length) {
      this.showError('Some files were rejected. Please select valid image files (JPG, PNG, GIF, WebP) under 5MB each.');
    }

    // Add new files to image states
    validFiles.forEach(file => {
      const blobUrl = URL.createObjectURL(file);
      this.imageStates.push({
        url: blobUrl,
        isNew: true,
        file,
        isUploaded: false
      });
    });

    // Clear the file input
    event.target.value = '';
  }

  private validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) return false;
    if (file.size > 5 * 1024 * 1024) return false; // 5MB limit
    return true;
  }

  removeImage(index: number) {
    const imageState = this.imageStates[index];
    
    if (imageState.isNew && imageState.url.startsWith('blob:')) {
      // New image - just remove from state and cleanup blob URL
      URL.revokeObjectURL(imageState.url);
      this.imageStates.splice(index, 1);
    } else {
      // Existing image - mark for deletion (don't actually delete until save)
      this.imageStates[index] = {
        ...imageState,
        isDeleted: true
      };
    }
  }

  undoRemoveImage(index: number) {
    // Allow undoing image removal
    if (this.imageStates[index].isDeleted) {
      this.imageStates[index] = {
        ...this.imageStates[index],
        isDeleted: false
      };
    }
  }

  // Transaction-safe save process
  async saveProject() {
    if (!this.projectForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    this.pendingUploads = [];

    try {
      const formValue = this.projectForm.value;
      let projectId = this.project?.id;

      // Step 1: Create project if new (without images first)
      if (this.isNewProject) {
        const newProject = await this.createProjectWithoutImages(formValue);
        projectId = newProject.id;
        this.project = newProject;
      }

      // Step 2: Upload new images
      await this.uploadNewImages(projectId!);

      // Step 3: Prepare final image URLs (excluding deleted ones)
      const finalImageUrls = this.imageStates
        .filter(state => !state.isDeleted)
        .map(state => state.url);

      // Step 4: Update project with all data including final image URLs
      await this.updateProjectWithImages(projectId!, formValue, finalImageUrls);

      // Step 5: Clean up deleted images from storage (only after successful save)
      await this.cleanupDeletedImages();

      this.showSuccess(this.isNewProject ? 'Project created successfully!' : 'Project updated successfully!');
      this.goBack();

    } catch (error: any) {
      console.error('Save error:', error);
      
      // Rollback: Clean up any uploaded images on failure
      await this.rollbackUploadedImages();
      
      this.showError(`Error saving project: ${error.message}`);
    } finally {
      this.isSaving = false;
      this.uploadingImages = false;
      this.uploadProgress = {};
    }
  }

  private async createProjectWithoutImages(formValue: any): Promise<Project> {
    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formValue.title,
      shortDescription: formValue.shortDescription,
      description: formValue.description,
      category: formValue.category as ProjectCategory,
      status: formValue.status as ProjectStatus,
      technologies: this.parseTechnologies(formValue.technologiesInput),
      liveUrl: formValue.demoUrl || undefined,
      githubUrl: formValue.githubUrl || undefined,
      featured: formValue.featured,
      images: [],
      startDate: new Date()
    };

    return new Promise((resolve, reject) => {
      this.createProjectUseCase.execute(newProject).subscribe({
        next: (project) => resolve(project),
        error: (error) => reject(error)
      });
    });
  }

  private async uploadNewImages(projectId: string): Promise<void> {
    const newImages = this.imageStates.filter(state => state.isNew && !state.isDeleted && !state.isUploaded);
    
    if (newImages.length === 0) return;

    this.uploadingImages = true;

    for (const imageState of newImages) {
      if (!imageState.file) continue;

      try {
        const uniqueFilename = this.storageService.generateUniqueFilename(imageState.file.name, 'project');
        const storagePath = this.storageService.getProjectImagePath(projectId, uniqueFilename);

        const downloadUrl = await this.storageService.uploadFile(
          imageState.file,
          storagePath,
          (progress) => {
            this.uploadProgress[imageState.file!.name] = progress;
          }
        );

        // Update image state with new URL and mark as uploaded
        imageState.url = downloadUrl;
        imageState.isUploaded = true;
        this.pendingUploads.push(downloadUrl);

        // Cleanup blob URL
        if (imageState.url.startsWith('blob:')) {
          URL.revokeObjectURL(imageState.url);
        }

      } catch (error) {
        throw new Error(`Failed to upload ${imageState.file.name}: ${error}`);
      }
    }
  }

  private async updateProjectWithImages(projectId: string, formValue: any, imageUrls: string[]): Promise<void> {
    const updateData = {
      title: formValue.title,
      shortDescription: formValue.shortDescription,
      description: formValue.description,
      category: formValue.category as ProjectCategory,
      status: formValue.status as ProjectStatus,
      technologies: this.parseTechnologies(formValue.technologiesInput),
      liveUrl: formValue.demoUrl || undefined,
      githubUrl: formValue.githubUrl || undefined,
      featured: formValue.featured,
      images: imageUrls,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      this.updateProjectUseCase.execute(projectId, updateData).subscribe({
        next: () => resolve(),
        error: (error) => reject(error)
      });
    });
  }

  private async cleanupDeletedImages(): Promise<void> {
    const deletedImages = this.imageStates.filter(state => state.isDeleted && !state.isNew);
    
    for (const imageState of deletedImages) {
      try {
        if (imageState.url.includes('firebase')) {
          await this.storageService.deleteFile(imageState.url);
        }
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Don't fail the whole operation for cleanup issues
      }
    }
  }

  private async rollbackUploadedImages(): Promise<void> {
    for (const uploadUrl of this.pendingUploads) {
      try {
        await this.storageService.deleteFile(uploadUrl);
      } catch (error) {
        console.warn('Failed to rollback uploaded image:', error);
      }
    }
    this.pendingUploads = [];
  }

  private parseTechnologies(input: string): string[] {
    return input
      ? input.split(',').map(tech => tech.trim()).filter(tech => tech)
      : [];
  }

  private markFormGroupTouched() {
    Object.keys(this.projectForm.controls).forEach(key => {
      this.projectForm.get(key)?.markAsTouched();
    });
  }

  private cleanupBlobUrls() {
    this.imageStates.forEach(state => {
      if (state.url.startsWith('blob:')) {
        URL.revokeObjectURL(state.url);
      }
    });
  }

  // Navigation and UI
  goBack() {
    this.router.navigate(['/admin/projects']);
  }

  cancel() {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  private hasUnsavedChanges(): boolean {
    // Check if form is dirty or if there are pending image changes
    return this.projectForm.dirty || 
           this.imageStates.some(state => state.isNew || state.isDeleted);
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

  // Utility getters for template
  get visibleImages() {
    return this.imageStates.filter(state => !state.isDeleted);
  }

  get deletedImages() {
    return this.imageStates.filter(state => state.isDeleted);
  }

  get hasNewImages() {
    return this.imageStates.some(state => state.isNew && !state.isDeleted);
  }
}
