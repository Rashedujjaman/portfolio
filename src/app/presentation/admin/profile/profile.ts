import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GetProfileUseCase, UpdateProfileUseCase, CreateProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { Profile, SocialLink } from '../../../domain/entities/profile.entity';
import { ProfileRepositoryImpl } from '../../../data/repositories/profile-repository.impl';

@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class AdminProfile implements OnInit {
  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  uploadProgress = 0;
  statusMessage = '';
  hasError = false;
  currentProfile: Profile | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private getProfileUseCase: GetProfileUseCase,
    private updateProfileusecase: UpdateProfileUseCase,
    private createProfileUseCase: CreateProfileUseCase,
    private profileRepository: ProfileRepositoryImpl
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.loadProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      title: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      location: [''],
      bio: ['', [Validators.required]],
      skillsInput: [''],
      profileImageUrl: [''],
      linkedinUrl: [''],
      githubUrl: [''],
      twitterUrl: [''],
      websiteUrl: ['']
    });
  }

  private loadProfile() {
    this.getProfileUseCase.execute().subscribe({
      next: (profile) => {
        if (profile) {
          this.currentProfile = profile;
          this.isEditing = true;
          this.populateForm(profile);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(profile: Profile) {
    // Helper function to find social link by platform
    const findSocialLink = (platform: string) => 
      profile.socialLinks?.find(link => link.platform === platform)?.url || '';

    this.profileForm.patchValue({
      name: profile.name,
      title: profile.title,
      email: profile.email,
      phone: profile.phone || '',
      location: profile.location || '',
      bio: profile.bio,
      skillsInput: profile.skills?.join(', ') || '',
      profileImageUrl: profile.profileImage || '',
      linkedinUrl: findSocialLink('linkedin'),
      githubUrl: findSocialLink('github'),
      twitterUrl: findSocialLink('twitter'),
      websiteUrl: findSocialLink('website')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        this.showError('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showError('Please select a valid image file');
        return;
      }

      this.uploadImage(file);
    }
  }

  private uploadImage(file: File) {
    // This is a simplified implementation
    // In a real application, you would upload to Firebase Storage
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profileForm.patchValue({
        profileImageUrl: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 1000);
      }
    }, 100);
  }

  removeImage() {
    this.profileForm.patchValue({
      profileImageUrl: ''
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.statusMessage = '';
      this.hasError = false;

      const formValue = this.profileForm.value;
      const profileData: Partial<Profile> = {
        name: formValue.name,
        title: formValue.title,
        email: formValue.email,
        phone: formValue.phone || undefined,
        location: formValue.location || undefined,
        bio: formValue.bio,
        skills: formValue.skillsInput 
          ? formValue.skillsInput.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill)
          : [],
        profileImage: formValue.profileImageUrl || '',
        socialLinks: this.createSocialLinks(formValue),
        languages: this.currentProfile?.languages || []
      };

      if (this.isEditing && this.currentProfile) {
        // Update existing profile
        const updatedProfile: Profile = {
          ...this.currentProfile,
          ...profileData,
          updatedAt: new Date()
        };

        this.updateProfileusecase.execute(updatedProfile).subscribe({
          next: () => {
            this.isSaving = false;
            this.showSuccess('Profile updated successfully!');
            setTimeout(() => {
              this.goBack();
            }, 2000);
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError(`Error updating profile: ${error.message}`);
          }
        });
      } else {
        // Create new profile
        const newProfile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
          ...profileData as Profile,
          languages: []
        };

        this.createProfileUseCase.execute(newProfile).subscribe({
          next: () => {
            this.isSaving = false;
            this.showSuccess('Profile created successfully!');
            setTimeout(() => {
              this.goBack();
            }, 2000);
          },
          error: (error: any) => {
            this.isSaving = false;
            this.showError(`Error creating profile: ${error.message}`);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  private showSuccess(message: string) {
    this.statusMessage = message;
    this.hasError = false;
  }

  private showError(message: string) {
    this.statusMessage = message;
    this.hasError = true;
  }

  private createSocialLinks(formValue: any): SocialLink[] {
    const socialLinks: SocialLink[] = [];
    
    if (formValue.linkedinUrl) {
      socialLinks.push({
        platform: 'linkedin',
        url: formValue.linkedinUrl,
        icon: 'linkedin'
      });
    }
    
    if (formValue.githubUrl) {
      socialLinks.push({
        platform: 'github',
        url: formValue.githubUrl,
        icon: 'github'
      });
    }
    
    if (formValue.twitterUrl) {
      socialLinks.push({
        platform: 'twitter',
        url: formValue.twitterUrl,
        icon: 'twitter'
      });
    }
    
    if (formValue.websiteUrl) {
      socialLinks.push({
        platform: 'website',
        url: formValue.websiteUrl,
        icon: 'website'
      });
    }
    
    return socialLinks;
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
