import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ProfileRepository } from '../domain/repositories/profile.repository';
import { ExperienceRepository } from '../domain/repositories/experience.repository';
import { Profile } from '../domain/entities/profile.entity';
import { Experience } from '../domain/entities/experience.entity';

@Injectable({
  providedIn: 'root'
})
export class SkillSyncService {
  private profileRepository = inject(ProfileRepository);
  private experienceRepository = inject(ExperienceRepository);

  /**
   * Synchronizes skills from experience technologies to user profile
   * Called when creating or updating experiences
   */
  syncSkillsToProfile(newTechnologies: string[]): Observable<void> {
    return this.profileRepository.getProfile().pipe(
      switchMap(profile => {
        if (!profile) {
          return of(null);
        }

        const currentSkills = profile.skills || [];
        const uniqueNewSkills = newTechnologies.filter(tech => 
          !currentSkills.some(skill => 
            skill.toLowerCase() === tech.toLowerCase()
          )
        );

        if (uniqueNewSkills.length === 0) {
          return of(null); // No new skills to add
        }

        const updatedProfile = {
          ...profile,
          skills: [...currentSkills, ...uniqueNewSkills],
          updatedAt: new Date()
        };
        
        return this.profileRepository.updateProfile(updatedProfile);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error syncing skills to profile:', error);
        return of(void 0); // Don't fail the main operation
      })
    );
  }

  /**
   * Removes skills from profile that are no longer used in any experience
   * Called when deleting experiences or removing technologies
   */
  cleanupUnusedSkills(): Observable<void> {
    return forkJoin({
      profile: this.profileRepository.getProfile(),
      experiences: this.experienceRepository.getExperiences()
    }).pipe(
      switchMap(({ profile, experiences }) => {
        if (!profile || !profile.skills) {
          return of(null);
        }

        // Get all technologies currently used in experiences
        const usedTechnologies = new Set<string>();
        experiences.forEach(exp => {
          (exp.technologies || []).forEach(tech => 
            usedTechnologies.add(tech.toLowerCase())
          );
        });

        // Filter out skills that are no longer used
        const activeSkills = profile.skills.filter(skill =>
          usedTechnologies.has(skill.toLowerCase())
        );

        if (activeSkills.length === profile.skills.length) {
          return of(null); // No skills to remove
        }

        const updatedProfile = {
          ...profile,
          skills: activeSkills,
          updatedAt: new Date()
        };

        return this.profileRepository.updateProfile(updatedProfile);
      }),
      map(() => void 0),
      catchError(error => {
        console.error('Error cleaning up unused skills:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Gets skills statistics from profile and experiences
   * This replaces the need for separate use cases
   */
  getSkillsStatistics(): Observable<{
    totalSkills: number;
    skillsWithExperience: { skill: string; count: number; years?: number }[];
    allSkills: string[];
  }> {
    return forkJoin({
      profile: this.profileRepository.getProfile(),
      experiences: this.experienceRepository.getExperiences()
    }).pipe(
      map(({ profile, experiences }) => {
        const allSkills = profile?.skills || [];
        const skillStats = this.calculateSkillsWithExperience(experiences, allSkills);

        return {
          totalSkills: allSkills.length,
          skillsWithExperience: skillStats,
          allSkills
        };
      })
    );
  }

  private calculateSkillsWithExperience(experiences: Experience[], profileSkills: string[]): { skill: string; count: number; years?: number }[] {
    const skillStats = new Map<string, { count: number; totalMonths: number }>();

    // Initialize with profile skills
    profileSkills.forEach(skill => {
      skillStats.set(skill, { count: 0, totalMonths: 0 });
    });

    // Count usage in experiences
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

      (exp.technologies || []).forEach(tech => {
        if (skillStats.has(tech)) {
          const current = skillStats.get(tech)!;
          skillStats.set(tech, {
            count: current.count + 1,
            totalMonths: current.totalMonths + months
          });
        }
      });
    });

    // Convert to array format
    return Array.from(skillStats.entries()).map(([skill, stats]) => ({
      skill,
      count: stats.count,
      years: stats.totalMonths > 0 ? Math.round((stats.totalMonths / 12) * 10) / 10 : undefined
    }));
  }
}
