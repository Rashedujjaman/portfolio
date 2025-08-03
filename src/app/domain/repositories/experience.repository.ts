import { Observable } from 'rxjs';
import { Experience, Education } from '../entities/experience.entity';

export abstract class ExperienceRepository {
  abstract getExperiences(): Observable<Experience[]>;
  abstract getExperience(id: string): Observable<Experience | null>;
  abstract createExperience(experience: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Observable<Experience>;
  abstract updateExperience(id: string, experience: Partial<Experience>): Observable<Experience>;
  abstract deleteExperience(id: string): Observable<void>;
}

export abstract class EducationRepository {
  abstract getEducations(): Observable<Education[]>;
  abstract getEducation(id: string): Observable<Education | null>;
  abstract createEducation(education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>): Observable<Education>;
  abstract updateEducation(id: string, education: Partial<Education>): Observable<Education>;
  abstract deleteEducation(id: string): Observable<void>;
}
