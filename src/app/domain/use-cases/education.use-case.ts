import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Education } from '../entities/experience.entity';
import { EducationRepository } from '../repositories/experience.repository';

@Injectable({
  providedIn: 'root'
})
export class GetEducationsUseCase {
  private educationRepository = inject(EducationRepository);

  execute(): Observable<Education[]> {
    return this.educationRepository.getEducations();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetEducationByIdUseCase {
  private educationRepository = inject(EducationRepository);

  execute(id: string): Observable<Education | null> {
    return this.educationRepository.getEducation(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AddEducationUseCase {
  private educationRepository = inject(EducationRepository);

  execute(education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>): Observable<Education> {
    return this.educationRepository.createEducation(education);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateEducationUseCase {
  private educationRepository = inject(EducationRepository);

  execute(id: string, education: Partial<Education>): Observable<Education> {
    return this.educationRepository.updateEducation(id, education);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteEducationUseCase {
  private educationRepository = inject(EducationRepository);

  execute(id: string): Observable<void> {
    return this.educationRepository.deleteEducation(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetEducationStatsUseCase {
  private educationRepository = inject(EducationRepository);

  execute(): Observable<{
    totalEducation: number;
    degrees: { [key: string]: number };
    institutions: { [key: string]: number };
    fields: { [key: string]: number };
  }> {
    return new Observable(observer => {
      this.educationRepository.getEducations().subscribe(education => {
        const stats = {
          totalEducation: education.length,
          degrees: {} as { [key: string]: number },
          institutions: {} as { [key: string]: number },
          fields: {} as { [key: string]: number }
        };

        // Count by degrees, institutions, and fields
        education.forEach(edu => {
          stats.degrees[edu.degree] = (stats.degrees[edu.degree] || 0) + 1;
          stats.institutions[edu.institution] = (stats.institutions[edu.institution] || 0) + 1;
          stats.fields[edu.fieldOfStudy] = (stats.fields[edu.fieldOfStudy] || 0) + 1;
        });

        observer.next(stats);
        observer.complete();
      });
    });
  }
}
