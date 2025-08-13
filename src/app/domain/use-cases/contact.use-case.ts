import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface ContactSubmission extends ContactForm {
  id: string;
  submittedAt: Date;
  status: 'pending' | 'read' | 'replied';
  ipAddress?: string;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmitContactFormUseCase {
  private http = inject(HttpClient);

  // Cloud Function endpoint path (adjust region if deployed elsewhere)
  // Endpoint: for local dev hitting emulator or deployed function via Hosting rewrite.
  // Adjust if using region; consider moving to environment config.
  // Use relative path for proxy during development, absolute URL for production
  private endpoint = environment.production 
    ? (environment.api?.contactEmailUrl || 'https://us-central1-rdjportfolio.cloudfunctions.net/sendContactEmail')
    : '/sendContactEmail';

  execute(contactForm: ContactForm): Observable<ContactSubmission> {
    // Validate form data
    if (!contactForm.name?.trim()) {
      throw new Error('Name is required');
    }
    if (!contactForm.email?.trim() || !this.isValidEmail(contactForm.email)) {
      throw new Error('Valid email is required');
    }
    if (!contactForm.subject?.trim()) {
      throw new Error('Subject is required');
    }
    if (!contactForm.message?.trim()) {
      throw new Error('Message is required');
    }

    // Create submission object
    const submission: ContactSubmission = {
      id: this.generateId(),
      ...contactForm,
      submittedAt: new Date(),
      status: 'pending'
    };

    // Send to backend email function with error handling
    return this.http.post<{ success?: boolean; id?: string }>(this.endpoint, contactForm).pipe(
      map(resp => ({ ...submission, id: resp.id || submission.id }))
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateId(): string {
    return 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ValidateContactFormUseCase {
  execute(contactForm: Partial<ContactForm>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contactForm.name?.trim()) {
      errors.push('Name is required');
    } else if (contactForm.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (contactForm.name.length > 50) {
      errors.push('Name must be less than 50 characters');
    }

    if (!contactForm.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(contactForm.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!contactForm.subject?.trim()) {
      errors.push('Subject is required');
    } else if (contactForm.subject.length < 5) {
      errors.push('Subject must be at least 5 characters');
    } else if (contactForm.subject.length > 100) {
      errors.push('Subject must be less than 100 characters');
    }

    if (!contactForm.message?.trim()) {
      errors.push('Message is required');
    } else if (contactForm.message.length < 10) {
      errors.push('Message must be at least 10 characters');
    } else if (contactForm.message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    if (contactForm.phone && contactForm.phone.trim()) {
      if (!this.isValidPhone(contactForm.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - adjust based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}
