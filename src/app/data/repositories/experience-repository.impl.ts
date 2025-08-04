import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExperienceRepository } from '../../domain/repositories/experience.repository';
import { Experience as ExperienceEntity, Education } from '../../domain/entities/experience.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class ExperienceRepositoryImpl implements ExperienceRepository {
  private readonly COLLECTION_NAME = 'experiences';
  private firebaseDataSource = inject(FirebaseDataSource);

  getExperiences(): Observable<ExperienceEntity[]> {
    return this.firebaseDataSource.getAll<ExperienceEntity>(this.COLLECTION_NAME, [
      this.firebaseDataSource.createOrderByCondition('startDate', 'desc')
    ]);
  }

  getExperience(id: string): Observable<ExperienceEntity | null> {
    return this.firebaseDataSource.getById<ExperienceEntity>(this.COLLECTION_NAME, id);
  }

  createExperience(experience: Omit<ExperienceEntity, 'id' | 'createdAt' | 'updatedAt'>): Observable<ExperienceEntity> {
    return this.firebaseDataSource.create<ExperienceEntity>(this.COLLECTION_NAME, experience);
  }

  updateExperience(id: string, experience: Partial<ExperienceEntity>): Observable<ExperienceEntity> {
    return this.firebaseDataSource.update<ExperienceEntity>(this.COLLECTION_NAME, id, experience);
  }

  deleteExperience(id: string): Observable<void> {
    return this.firebaseDataSource.delete(this.COLLECTION_NAME, id);
  }
}
