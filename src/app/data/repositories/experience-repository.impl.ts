import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExperienceRepository } from '../../domain/repositories/experience.repository';
import { Experience as ExperienceEntity, Education } from '../../domain/entities/experience.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class ExperienceRepositoryImpl implements ExperienceRepository {
  private firebaseDataSource = inject(FirebaseDataSource);

  getExperiences(): Observable<ExperienceEntity[]> {
    return this.firebaseDataSource.getAll<ExperienceEntity>('experiences', [
      this.firebaseDataSource.createOrderByCondition('startDate', 'desc')
    ]);
  }

  getExperience(id: string): Observable<ExperienceEntity | null> {
    return this.firebaseDataSource.getById<ExperienceEntity>('experiences', id);
  }

  createExperience(experience: Omit<ExperienceEntity, 'id' | 'createdAt' | 'updatedAt'>): Observable<ExperienceEntity> {
    return this.firebaseDataSource.create<ExperienceEntity>('experiences', experience);
  }

  updateExperience(id: string, experience: Partial<ExperienceEntity>): Observable<ExperienceEntity> {
    return this.firebaseDataSource.update<ExperienceEntity>('experiences', id, experience);
  }

  deleteExperience(id: string): Observable<void> {
    return this.firebaseDataSource.delete('experiences', id);
  }

  // Education methods
  getEducation(): Observable<Education[]> {
    return this.firebaseDataSource.getAll<Education>('education', [
      this.firebaseDataSource.createOrderByCondition('startDate', 'desc')
    ]);
  }

  createEducation(education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>): Observable<Education> {
    return this.firebaseDataSource.create<Education>('education', education);
  }

  updateEducation(id: string, education: Partial<Education>): Observable<Education> {
    return this.firebaseDataSource.update<Education>('education', id, education);
  }

  deleteEducation(id: string): Observable<void> {
    return this.firebaseDataSource.delete('education', id);
  }
}
