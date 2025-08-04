import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  AddTravelUseCase, 
  UpdateTravelUseCase, 
  GetTravelByIdUseCase 
} from '../../../../domain/use-cases/lifestyle.use-case';
import { Travel } from '../../../../domain/entities/lifestyle.entity';
import { StorageService } from '../../../../core/storage.service';

interface ImageState {
  url: string;
  isNew: boolean;
  file?: File;
  isDeleted?: boolean;
  isUploaded?: boolean;
}

@Component({
  selector: 'app-travel-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './travel-edit.html',
  styleUrl: './travel-edit.scss'
})
export class TravelEditComponent implements OnInit {
  travelForm: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  travelId: string | null = null;
  errors: string[] = [];
  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  // Image management with transaction safety
  imageStates: ImageState[] = [];
  uploadingImages = false;
  uploadProgress: { [key: string]: number } = {};
  pendingUploads: string[] = []; // Track uploaded URLs for potential rollback

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private addTravelUseCase: AddTravelUseCase,
    private updateTravelUseCase: UpdateTravelUseCase,
    private getTravelByIdUseCase: GetTravelByIdUseCase,
    private storageService: StorageService
  ) {
    this.travelForm = this.createForm();
  }

  ngOnInit() {
    this.travelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.travelId;
    this.imageStates = [];

    if (this.isEditMode && this.travelId) {
      this.loadTravel(this.travelId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      visitDate: ['', Validators.required],
      duration: [1, [Validators.required, Validators.min(1)]],
      featured: [false],
      coordinates: this.fb.group({
        latitude: [''],
        longitude: ['']
      }),
      images: this.fb.array([]),
      highlights: this.fb.array([])
    });
  }

  private loadTravel(id: string) {
    this.isLoading = true;
    this.getTravelByIdUseCase.execute(id).subscribe({
      next: (travel) => {
        if (travel) {
          this.populateForm(travel);
        } else {
          this.showError('Travel not found');
          this.navigateBack();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading travel:', error);
        this.showError('Failed to load travel data');
        this.isLoading = false;
      }
    });
  }

  private populateForm(travel: Travel) {
    this.travelForm.patchValue({
      title: travel.title,
      country: travel.country,
      city: travel.city,
      description: travel.description,
      visitDate: new Date(travel.visitDate).toISOString().split('T')[0],
      duration: travel.duration,
      featured: travel.featured,
      coordinates: {
        latitude: travel.coordinates?.latitude || '',
        longitude: travel.coordinates?.longitude || ''
      }
    });

    // Initialize image states for existing images
    if (travel.images) {
      this.initializeImageStates(travel.images);
    }

    // Populate highlights array
    const highlightsArray = this.travelForm.get('highlights') as FormArray;
    highlightsArray.clear();
    if (travel.highlights) {
      travel.highlights.forEach(highlight => {
        highlightsArray.push(this.fb.control(highlight, Validators.required));
      });
    }
  }

  private initializeImageStates(imageUrls: string[]) {
    this.imageStates = imageUrls.map(url => ({
      url,
      isNew: false,
      isUploaded: true
    }));
  }

  get highlights(): FormArray {
    return this.travelForm.get('highlights') as FormArray;
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

  addImageUrl() {
    // Add empty image URL for manual input (keeping this for backward compatibility)
    this.imageStates.push({
      url: '',
      isNew: true,
      isUploaded: false
    });
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

  updateImageUrl(index: number, url: string) {
    if (this.imageStates[index]) {
      this.imageStates[index].url = url;
    }
  }

  addHighlight() {
    this.highlights.push(this.fb.control('', Validators.required));
  }

  removeHighlight(index: number) {
    this.highlights.removeAt(index);
  }

  onSubmit() {
    if (this.travelForm.valid) {
      this.saveTravel();
    } else {
      this.markFormGroupTouched();
      this.showError('Please fill in all required fields correctly');
    }
  }

  // Transaction-safe save process
  async saveTravel() {
    if (!this.travelForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    this.pendingUploads = [];

    try {
      const formValue = this.travelForm.value;
      let travelId = this.travelId;

      // Step 1: Create travel if new (without images first)
      if (!this.isEditMode) {
        const newTravel = await this.createTravelWithoutImages(formValue);
        travelId = newTravel.id;
        this.travelId = newTravel.id;
      }

      // Step 2: Upload new images
      await this.uploadNewImages(travelId!);

      // Step 3: Prepare final image URLs (excluding deleted ones)
      const finalImageUrls = this.imageStates
        .filter(state => !state.isDeleted)
        .map(state => state.url)
        .filter(url => url.trim() !== '');

      // Step 4: Update travel with all data including final image URLs
      await this.updateTravelWithImages(travelId!, formValue, finalImageUrls);

      // Step 5: Clean up deleted images from storage (only after successful save)
      await this.cleanupDeletedImages();

      this.showSuccess(this.isEditMode ? 'Travel updated successfully!' : 'Travel created successfully!');
      
      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        this.navigateBack();
      }, 1500);

    } catch (error: any) {
      console.error('Save error:', error);
      
      // Rollback: Clean up any uploaded images on failure
      await this.rollbackUploadedImages();
      
      this.showError(`Error saving travel: ${error.message}`);
    } finally {
      this.isSaving = false;
      this.uploadingImages = false;
      this.uploadProgress = {};
    }
  }

  private async createTravelWithoutImages(formValue: any): Promise<Travel> {
    const newTravel = {
      title: formValue.title.trim(),
      country: formValue.country.trim(),
      city: formValue.city.trim(),
      description: formValue.description.trim(),
      visitDate: new Date(formValue.visitDate),
      duration: parseInt(formValue.duration),
      featured: formValue.featured,
      coordinates: formValue.coordinates.latitude && formValue.coordinates.longitude ? {
        latitude: parseFloat(formValue.coordinates.latitude),
        longitude: parseFloat(formValue.coordinates.longitude)
      } : undefined,
      images: [],
      highlights: formValue.highlights.filter((highlight: string) => highlight.trim() !== '')
    };

    return new Promise((resolve, reject) => {
      this.addTravelUseCase.execute(newTravel).subscribe({
        next: (travel) => resolve(travel),
        error: (error) => reject(error)
      });
    });
  }

  private async uploadNewImages(travelId: string): Promise<void> {
    const newImages = this.imageStates.filter(state => state.isNew && !state.isDeleted && !state.isUploaded && state.file);
    
    if (newImages.length === 0) return;

    this.uploadingImages = true;

    for (const imageState of newImages) {
      if (!imageState.file) continue;

      try {
        const uniqueFilename = this.storageService.generateUniqueFilename(imageState.file.name, 'travel');
        const storagePath = this.storageService.getTravelImagePath(travelId, uniqueFilename);

        const downloadUrl = await this.storageService.uploadFile(
          imageState.file,
          storagePath,
          (progress) => {
            this.uploadProgress[imageState.file!.name] = progress;
          }
        );

        // Update image state with new URL and mark as uploaded
        const oldUrl = imageState.url;
        imageState.url = downloadUrl;
        imageState.isUploaded = true;
        this.pendingUploads.push(downloadUrl);

        // Cleanup blob URL
        if (oldUrl.startsWith('blob:')) {
          URL.revokeObjectURL(oldUrl);
        }

      } catch (error) {
        throw new Error(`Failed to upload ${imageState.file.name}: ${error}`);
      }
    }
  }

  private async updateTravelWithImages(travelId: string, formValue: any, imageUrls: string[]): Promise<void> {
    const updateData = {
      title: formValue.title.trim(),
      country: formValue.country.trim(),
      city: formValue.city.trim(),
      description: formValue.description.trim(),
      visitDate: new Date(formValue.visitDate),
      duration: parseInt(formValue.duration),
      featured: formValue.featured,
      coordinates: formValue.coordinates.latitude && formValue.coordinates.longitude ? {
        latitude: parseFloat(formValue.coordinates.latitude),
        longitude: parseFloat(formValue.coordinates.longitude)
      } : undefined,
      images: imageUrls,
      highlights: formValue.highlights.filter((highlight: string) => highlight.trim() !== '')
    };

    return new Promise((resolve, reject) => {
      this.updateTravelUseCase.execute(travelId, updateData).subscribe({
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
        console.warn('Failed to delete image from storage:', imageState.url, error);
        // Don't fail the entire operation for cleanup issues
      }
    }
  }

  private async rollbackUploadedImages(): Promise<void> {
    for (const uploadedUrl of this.pendingUploads) {
      try {
        await this.storageService.deleteFile(uploadedUrl);
      } catch (error) {
        console.warn('Failed to rollback uploaded image:', uploadedUrl, error);
      }
    }
    this.pendingUploads = [];
  }

  private markFormGroupTouched() {
    Object.keys(this.travelForm.controls).forEach(key => {
      const control = this.travelForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/placeholder-travel.jpg';
    }
  }

  private showSuccess(message: string) {
    this.statusMessage = message;
    this.statusType = 'success';
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3000);
  }

  private showError(message: string) {
    this.statusMessage = message;
    this.statusType = 'error';
    this.errors = [message];
  }

  navigateBack() {
    this.router.navigate(['/admin/travel']);
  }
}
