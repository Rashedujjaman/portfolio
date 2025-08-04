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

// ========================================
// DEPRECATED: These use cases are kept for backward compatibility
// but should not be used in new code. Use frontend calculations instead
// to avoid redundant Firebase calls.
// ========================================

/**
 * @deprecated Use frontend calculation in components instead.
 * This causes redundant Firebase calls. Skills should come from profile.
 */

/**
 * @deprecated Use frontend calculation in components instead.
 * This causes redundant Firebase calls. Skills should come from profile.
 */
@Injectable({
  providedIn: 'root'
})
export class GetAllSkillsUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(): Observable<string[]> {
    return this.experienceRepository.getExperiences().pipe(
      map(experiences => {
        const allSkills = new Set<string>();
        experiences.forEach(exp => {
          exp.technologies.forEach(tech => allSkills.add(tech));
        });
        return Array.from(allSkills).sort();
      })
    );
  }
}

/**
 * @deprecated Use frontend calculation in components instead.
 * This causes redundant Firebase calls. Skills should come from profile.
 */
@Injectable({
  providedIn: 'root'
})
export class GetSkillsWithExperienceUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(): Observable<{ skill: string; count: number; years: number }[]> {
    return this.experienceRepository.getExperiences().pipe(
      map(experiences => {
        const skillMap = new Map<string, { count: number; totalMonths: number }>();
        
        experiences.forEach(exp => {
          // Calculate duration in months
          const startDate = new Date(exp.startDate);
          const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
          
          exp.technologies.forEach(tech => {
            if (skillMap.has(tech)) {
              const existing = skillMap.get(tech)!;
              skillMap.set(tech, {
                count: existing.count + 1,
                totalMonths: existing.totalMonths + months
              });
            } else {
              skillMap.set(tech, { count: 1, totalMonths: months });
            }
          });
        });

        return Array.from(skillMap.entries())
          .map(([skill, data]) => ({
            skill,
            count: data.count,
            years: Math.round((data.totalMonths / 12) * 10) / 10
          }))
          .sort((a, b) => b.years - a.years);
      })
    );
  }
}

/**
 * @deprecated Use frontend calculation in components instead.
 * This causes redundant Firebase calls. Use calculateExperienceStats() in frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class GetExperienceStatsUseCase {
  private experienceRepository = inject(ExperienceRepository);

  execute(): Observable<{
    totalExperience: number;
    totalCompanies: number;
    totalSkills: number;
    yearsOfExperience: number;
    currentPosition?: string;
    currentCompany?: string;
  }> {
    return this.experienceRepository.getExperiences().pipe(
      map(experiences => {
        const currentExp = experiences.find(exp => exp.current);
        const allSkills = new Set<string>();
        let totalMonths = 0;

        experiences.forEach(exp => {
          // Calculate total experience in months
          const startDate = new Date(exp.startDate);
          const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
          totalMonths += months;

          // Collect all unique skills
          exp.technologies.forEach(tech => allSkills.add(tech));
        });

        return {
          totalExperience: experiences.length,
          totalCompanies: new Set(experiences.map(exp => exp.company)).size,
          totalSkills: allSkills.size,
          yearsOfExperience: Math.round((totalMonths / 12) * 10) / 10,
          currentPosition: currentExp?.position,
          currentCompany: currentExp?.company
        };
      })
    );
  }
}
