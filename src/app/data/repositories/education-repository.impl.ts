import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EducationRepository } from '../../domain/repositories/experience.repository';
import { Education } from '../../domain/entities/experience.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class EducationRepositoryImpl implements EducationRepository {
  private readonly COLLECTION_NAME = 'educations';
  private firebaseDataSource = inject(FirebaseDataSource);

  getEducations(): Observable<Education[]> {
    return this.firebaseDataSource.getAll<Education>(this.COLLECTION_NAME, [
      this.firebaseDataSource.createOrderByCondition('startDate', 'desc')
    ]);
  }

  getEducation(id: string): Observable<Education | null> {
    return this.firebaseDataSource.getById<Education>(this.COLLECTION_NAME, id);
  }

  createEducation(education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>): Observable<Education> {
    return this.firebaseDataSource.create<Education>(this.COLLECTION_NAME, education);
  }

  updateEducation(id: string, education: Partial<Education>): Observable<Education> {
    return this.firebaseDataSource.update<Education>(this.COLLECTION_NAME, id, education);
  }

  deleteEducation(id: string): Observable<void> {
    return this.firebaseDataSource.delete(this.COLLECTION_NAME, id);
  }
}
