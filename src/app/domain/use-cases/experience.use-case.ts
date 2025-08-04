import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Experience } from '../entities/experience.entity';
import { ExperienceRepository } from '../repositories/experience.repository';
import { SkillSyncService } from '../../core/skill-sync.service';

@Injectable({
  providedIn: 'root'
})
export class GetExperiencesUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(): Observable<Experience[]> {
    return this.experienceRepository.getExperiences();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetExperienceByIdUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(id: string): Observable<Experience | null> {
    return this.experienceRepository.getExperience(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AddExperienceUseCase {
  private experienceRepository = inject(ExperienceRepository);
  private skillSyncService = inject(SkillSyncService);

  execute(experience: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Observable<Experience> {
    return this.experienceRepository.createExperience(experience).pipe(
      tap(createdExperience => {
        // Sync new technologies to profile skills (fire and forget)
        if (createdExperience.technologies?.length) {
          this.skillSyncService.syncSkillsToProfile(createdExperience.technologies).subscribe();
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateExperienceUseCase {
  private experienceRepository = inject(ExperienceRepository);
  private skillSyncService = inject(SkillSyncService);

  execute(id: string, experience: Partial<Experience>): Observable<Experience> {
    return this.experienceRepository.updateExperience(id, experience).pipe(
      tap(updatedExperience => {
        // Sync new technologies to profile skills (fire and forget)
        if (updatedExperience.technologies?.length) {
          this.skillSyncService.syncSkillsToProfile(updatedExperience.technologies).subscribe();
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteExperienceUseCase {
  private experienceRepository = inject(ExperienceRepository);
  private skillSyncService = inject(SkillSyncService);

  execute(id: string): Observable<void> {
    return this.experienceRepository.deleteExperience(id).pipe(
      tap(() => {
        // Clean up unused skills after deletion (fire and forget)
        this.skillSyncService.cleanupUnusedSkills().subscribe();
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetCurrentExperienceUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(): Observable<Experience | null> {
    return this.experienceRepository.getExperiences().pipe(
      map(experiences => {
        return experiences.find(exp => exp.current) || null;
      })
    );
  }
}
