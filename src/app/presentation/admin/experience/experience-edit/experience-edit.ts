import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { 
  AddExperienceUseCase, 
  UpdateExperienceUseCase, 
  GetExperienceByIdUseCase 
} from '../../../../domain/use-cases/experience.use-case';
import { Experience } from '../../../../domain/entities/experience.entity';

@Component({
  selector: 'app-experience-edit',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule],
  templateUrl: './experience-edit.html',
  styleUrl: './experience-edit.scss'
})
export class ExperienceEditComponent implements OnInit {
  experienceForm: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  experienceId: string | null = null;
  errors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private addExperienceUseCase: AddExperienceUseCase,
    private updateExperienceUseCase: UpdateExperienceUseCase,
    private getExperienceByIdUseCase: GetExperienceByIdUseCase
  ) {
    this.experienceForm = this.createForm();
  }

  ngOnInit() {
    this.experienceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.experienceId;

    if (this.isEditMode && this.experienceId) {
      this.loadExperience(this.experienceId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      company: ['', [Validators.required, Validators.minLength(2)]],
      position: ['', [Validators.required, Validators.minLength(2)]],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: ['', [Validators.required, Validators.minLength(10)]],
      achievements: this.fb.array([]),
      technologies: this.fb.array([]),
      companyWebsite: ['']
    });
  }

  private loadExperience(id: string) {
    this.isLoading = true;
    this.getExperienceByIdUseCase.execute(id).subscribe({
      next: (experience) => {
        if (experience) {
          this.populateForm(experience);
        } else {
          this.errors.push('Experience not found');
          this.router.navigate(['/admin/experience']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading experience:', error);
        this.errors.push('Failed to load experience');
        this.isLoading = false;
      }
    });
  }

  private populateForm(experience: Experience) {
    this.experienceForm.patchValue({
      company: experience.company,
      position: experience.position,
      location: experience.location,
      startDate: new Date(experience.startDate).toISOString().split('T')[0],
      endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
      current: experience.current,
      description: experience.description,
      companyWebsite: experience.companyWebsite || ''
    });

    // Populate achievements
    const achievementsArray = this.experienceForm.get('achievements') as FormArray;
    experience.achievements?.forEach(achievement => {
      achievementsArray.push(this.fb.control(achievement, Validators.required));
    });

    // Populate technologies
    const technologiesArray = this.experienceForm.get('technologies') as FormArray;
    experience.technologies?.forEach(tech => {
      technologiesArray.push(this.fb.control(tech, Validators.required));
    });
  }

  get achievements(): FormArray {
    return this.experienceForm.get('achievements') as FormArray;
  }

  get technologies(): FormArray {
    return this.experienceForm.get('technologies') as FormArray;
  }

  addAchievement() {
    this.achievements.push(this.fb.control('', Validators.required));
  }

  removeAchievement(index: number) {
    this.achievements.removeAt(index);
  }

  addTechnology() {
    this.technologies.push(this.fb.control('', Validators.required));
  }

  removeTechnology(index: number) {
    this.technologies.removeAt(index);
  }

  onCurrentChange() {
    const currentValue = this.experienceForm.get('current')?.value;
    const endDateControl = this.experienceForm.get('endDate');
    
    if (currentValue) {
      endDateControl?.setValue('');
      endDateControl?.clearValidators();
    } else {
      endDateControl?.setValidators([Validators.required]);
    }
    endDateControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.experienceForm.valid) {
      this.isSaving = true;
      this.errors = [];

      const formValue = this.experienceForm.value;
      const experienceData = {
        company: formValue.company,
        position: formValue.position,
        location: formValue.location,
        startDate: new Date(formValue.startDate),
        endDate: formValue.current || !formValue.endDate ? undefined : new Date(formValue.endDate),
        current: formValue.current,
        description: formValue.description,
        achievements: formValue.achievements.filter((a: string) => a.trim()),
        technologies: formValue.technologies.filter((t: string) => t.trim()),
        companyWebsite: formValue.companyWebsite || undefined
      };

      if (this.isEditMode && this.experienceId) {
        this.updateExperienceUseCase.execute(this.experienceId, experienceData).subscribe({
          next: () => {
            this.router.navigate(['/admin/experience']);
          },
          error: (error) => {
            console.error('Error updating experience:', error);
            this.errors.push('Failed to update experience');
            this.isSaving = false;
          }
        });
      } else {
        this.addExperienceUseCase.execute(experienceData).subscribe({
          next: () => {
            this.router.navigate(['/admin/experience']);
          },
          error: (error) => {
            console.error('Error creating experience:', error);
            this.errors.push('Failed to create experience');
            this.isSaving = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.errors = ['Please fix the validation errors below'];
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.experienceForm.controls).forEach(field => {
      const control = this.experienceForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });

    this.achievements.controls.forEach(control => control.markAsTouched());
    this.technologies.controls.forEach(control => control.markAsTouched());
  }

  goBack() {
    this.router.navigate(['/admin/experience']);
  }

  getFieldError(fieldName: string): string {
    const field = this.experienceForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      company: 'Company',
      position: 'Position',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }
}
