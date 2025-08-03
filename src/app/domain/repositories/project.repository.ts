import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';

export abstract class ProjectRepository {
  abstract getProjects(): Observable<Project[]>;
  abstract getProject(id: string): Observable<Project | null>;
  abstract getFeaturedProjects(): Observable<Project[]>;
  abstract createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project>;
  abstract updateProject(id: string, project: Partial<Project>): Observable<Project>;
  abstract deleteProject(id: string): Observable<void>;
}
