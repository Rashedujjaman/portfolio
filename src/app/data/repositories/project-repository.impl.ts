import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../../domain/entities/project.entity';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class ProjectRepositoryImpl extends ProjectRepository {
  private readonly COLLECTION_NAME = 'projects';
  private firebaseDataSource = inject(FirebaseDataSource);

  constructor() {
    super();
  }

  getProjects(): Observable<Project[]> {
    const orderBy = this.firebaseDataSource.createOrderByCondition('startDate', 'desc');
    return this.firebaseDataSource.getAll<Project>(this.COLLECTION_NAME, [orderBy]);
  }

  getProject(id: string): Observable<Project | null> {
    return this.firebaseDataSource.getById<Project>(this.COLLECTION_NAME, id);
  }

  getFeaturedProjects(): Observable<Project[]> {
    const whereCondition = this.firebaseDataSource.createWhereCondition('featured', '==', true);
    const orderBy = this.firebaseDataSource.createOrderByCondition('createdAt', 'desc');
    return this.firebaseDataSource.getAll<Project>(this.COLLECTION_NAME, [whereCondition, orderBy]);
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    return this.firebaseDataSource.create<Project>(this.COLLECTION_NAME, project);
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.firebaseDataSource.update<Project>(this.COLLECTION_NAME, id, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.firebaseDataSource.delete(this.COLLECTION_NAME, id);
  }
}
