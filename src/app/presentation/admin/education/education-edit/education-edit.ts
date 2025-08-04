import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { 
  AddEducationUseCase, 
  UpdateEducationUseCase, 
  GetEducationByIdUseCase 
} from '../../../../domain/use-cases/education.use-case';
import { Education } from '../../../../domain/entities/experience.entity';

@Component({
  selector: 'app-education-edit',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './education-edit.html',
  styleUrl: './education-edit.scss'
})
export class EducationEditComponent implements OnInit {
  educationForm: FormGroup;
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  educationId: string | null = null;
  errors: string[] = [];
  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private addEducationUseCase: AddEducationUseCase,
    private updateEducationUseCase: UpdateEducationUseCase,
    private getEducationByIdUseCase: GetEducationByIdUseCase
  ) {
    this.educationForm = this.createForm();
  }

  ngOnInit() {
    this.educationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.educationId;

    if (this.isEditMode && this.educationId) {
      this.loadEducation(this.educationId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      institution: ['', [Validators.required, Validators.minLength(2)]],
      degree: ['', [Validators.required, Validators.minLength(2)]],
      fieldOfStudy: ['', [Validators.required, Validators.minLength(2)]],
      location: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      gpa: [''],
      description: [''],
      achievements: this.fb.array([])
    });
  }

  private loadEducation(id: string) {
    this.isLoading = true;
    this.getEducationByIdUseCase.execute(id).subscribe({
      next: (education) => {
        if (education) {
          this.populateForm(education);
        } else {
          this.showError('Education not found');
          this.navigateBack();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading education:', error);
        this.showError('Failed to load education data');
        this.isLoading = false;
      }
    });
  }

  private populateForm(education: Education) {
    this.educationForm.patchValue({
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      location: education.location,
      startDate: new Date(education.startDate),
      endDate: education.endDate ? new Date(education.endDate) : null,
      gpa: education.gpa,
      description: education.description
    });

    // Populate achievements array
    const achievementsArray = this.educationForm.get('achievements') as FormArray;
    achievementsArray.clear();
    education.achievements.forEach(achievement => {
      achievementsArray.push(this.fb.control(achievement, Validators.required));
    });
  }

  get achievements(): FormArray {
    return this.educationForm.get('achievements') as FormArray;
  }

  addAchievement() {
    this.achievements.push(this.fb.control('', Validators.required));
  }

  removeAchievement(index: number) {
    this.achievements.removeAt(index);
  }

  onSubmit() {
    if (this.educationForm.valid) {
      this.saveEducation();
    } else {
      this.markFormGroupTouched();
      this.showError('Please fill in all required fields correctly');
    }
  }

  private saveEducation() {
    this.isSaving = true;
    this.errors = [];
    this.statusMessage = '';
    
    const formValue = this.educationForm.value;
    const educationData = {
      institution: formValue.institution.trim(),
      degree: formValue.degree.trim(),
      fieldOfStudy: formValue.fieldOfStudy.trim(),
      location: formValue.location?.trim() || '',
      startDate: formValue.startDate,
      endDate: formValue.endDate || null,
      gpa: formValue.gpa?.trim() || null,
      description: formValue.description?.trim() || null,
      achievements: formValue.achievements.filter((achievement: string) => achievement.trim() !== '')
    };

    const saveOperation = this.isEditMode && this.educationId
      ? this.updateEducationUseCase.execute(this.educationId, educationData)
      : this.addEducationUseCase.execute(educationData);

    saveOperation.subscribe({
      next: (education) => {
        const message = this.isEditMode ? 'Education updated successfully!' : 'Education created successfully!';
        this.showSuccess(message);
        
        // Navigate back after a short delay to show the success message
        setTimeout(() => {
          this.navigateBack();
        }, 1500);
      },
      error: (error) => {
        console.error('Error saving education:', error);
        this.showError('Failed to save education. Please try again.');
        this.isSaving = false;
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.educationForm.controls).forEach(key => {
      const control = this.educationForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
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
    this.router.navigate(['/admin/education']);
  }
}
