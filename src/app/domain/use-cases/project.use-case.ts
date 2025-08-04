import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProjectsUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(): Observable<Project[]> {
    return this.projectRepository.getProjects();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetFeaturedProjectsUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(): Observable<Project[]> {
    return this.projectRepository.getFeaturedProjects();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetProjectUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(id: string): Observable<Project | null> {
    return this.projectRepository.getProject(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CreateProjectUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    return this.projectRepository.createProject(project);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateProjectUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(id: string, project: Partial<Project>): Observable<Project> {
    return this.projectRepository.updateProject(id, project);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteProjectUseCase {
  private projectRepository = inject(ProjectRepository);

  execute(id: string): Observable<void> {
    return this.projectRepository.deleteProject(id);
  }
}
