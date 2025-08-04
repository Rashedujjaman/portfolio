import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EducationRepository } from '../../domain/repositories/experience.repository';
import { Education } from '../../domain/entities/experience.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class EducationRepositoryImpl implements EducationRepository {
  private firebaseDataSource = inject(FirebaseDataSource);

  getEducations(): Observable<Education[]> {
    return this.firebaseDataSource.getAll<Education>('education', [
      this.firebaseDataSource.createOrderByCondition('startDate', 'desc')
    ]);
  }

  getEducation(id: string): Observable<Education | null> {
    return this.firebaseDataSource.getById<Education>('education', id);
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
