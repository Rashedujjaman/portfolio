import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(): Observable<Project[]> {
    return this.projectRepository.getProjects();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetFeaturedProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(): Observable<Project[]> {
    return this.projectRepository.getFeaturedProjects();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(id: string): Observable<Project | null> {
    return this.projectRepository.getProject(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    return this.projectRepository.createProject(project);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(id: string, project: Partial<Project>): Observable<Project> {
    return this.projectRepository.updateProject(id, project);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  execute(id: string): Observable<void> {
    return this.projectRepository.deleteProject(id);
  }
}
