import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../../../domain/entities/profile.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { SubmitContactFormUseCase, ValidateContactFormUseCase, ContactForm } from '../../../domain/use-cases/contact.use-case';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profile: Profile | null = null;
  contactForm: FormGroup;
  isLoadingProfile = true;
  isSending = false;
  statusMessage = '';
  hasError = false;

  constructor(
    private fb: FormBuilder,
    private getProfileUseCase: GetProfileUseCase,
    private submitContactFormUseCase: SubmitContactFormUseCase,
    private validateContactFormUseCase: ValidateContactFormUseCase
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadProfile() {
    this.getProfileUseCase.execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoadingProfile = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isLoadingProfile = false;
        }
      });
  }

  onSubmit() {
    if (!this.contactForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const formData: ContactForm = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    // Validate the form data using the use case
    const validation = this.validateContactFormUseCase.execute(formData);
    if (!validation.isValid) {
      this.showError(validation.errors.join(', '));
      return;
    }

    this.isSending = true;
    this.statusMessage = '';
    this.hasError = false;

    // Submit the form using the use case
    this.submitContactFormUseCase.execute(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submission) => {
          this.showSuccess('Message sent successfully! I\'ll get back to you soon.');
          this.contactForm.reset();
          this.isSending = false;
          console.log('Contact form submitted:', submission);
        },
        error: (error) => {
          this.showError('Failed to send message. Please try again.');
          this.isSending = false;
          console.error('Error submitting contact form:', error);
        }
      });
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string) {
    this.hasError = false;
    this.statusMessage = message;
    setTimeout(() => {
      this.statusMessage = '';
    }, 5000);
  }

  private showError(message: string) {
    this.hasError = true;
    this.statusMessage = message;
    setTimeout(() => {
      this.statusMessage = '';
    }, 5000);
  }

  // Utility methods for social links
  getSocialIcon(platform: string): string {
    const iconMap: { [key: string]: string } = {
      'linkedin': '💼',
      'github': '💻',
      'twitter': '🐦',
      'facebook': '📘',
      'instagram': '📷',
      'website': '🌐',
      'youtube': '📺',
      'email': '✉️'
    };
    return iconMap[platform.toLowerCase()] || '🔗';
  }

  // Removed isLoading getter; page content now always renders with inline fallbacks
}
