import { Injectable } from '@angular/core';
import { FirebaseDataSource } from '../data/datasources/firebase.datasource';
import { SEED_PROFILE, SEED_PROJECTS, SEED_EXPERIENCE, SEED_EDUCATION, SEED_TRAVEL } from '../data/seed-data';
import { Profile } from '../domain/entities/profile.entity';
import { Project } from '../domain/entities/project.entity';
import { Experience, Education } from '../domain/entities/experience.entity';
import { Travel } from '../domain/entities/lifestyle.entity';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataSeedingService {

  constructor(private firebaseDataSource: FirebaseDataSource) {}

  seedAllData(): Observable<boolean> {
    console.log('Starting data seeding...');
    
    return forkJoin({
      profile: this.seedProfile(),
      projects: this.seedProjects(),
      experience: this.seedExperience(),
      education: this.seedEducation(),
      travel: this.seedTravel()
    }).pipe(
      map(() => {
        console.log('Data seeding completed successfully!');
        return true;
      }),
      catchError(error => {
        console.error('Data seeding failed:', error);
        return of(false);
      })
    );
  }

  private seedProfile(): Observable<any> {
    console.log('Seeding profile data...');
    return this.firebaseDataSource.getById<Profile>('profile', SEED_PROFILE.id!)
      .pipe(
        switchMap(existingProfile => {
          if (existingProfile) {
            console.log('Profile already exists, skipping...');
            return of(existingProfile);
          }
          return this.firebaseDataSource.create<Profile>('profile', SEED_PROFILE as Profile);
        }),
        catchError(error => {
          console.error('Error seeding profile:', error);
          return of(null);
        })
      );
  }

  private seedProjects(): Observable<any[]> {
    console.log('Seeding projects data...');
    const projectSeeds = SEED_PROJECTS.map(project => 
      this.firebaseDataSource.getById<Project>('projects', project.id!)
        .pipe(
          switchMap(existingProject => {
            if (existingProject) {
              console.log(`Project ${project.title} already exists, skipping...`);
              return of(existingProject);
            }
            return this.firebaseDataSource.create<Project>('projects', project as Project);
          }),
          catchError(error => {
            console.error(`Error seeding project ${project.title}:`, error);
            return of(null);
          })
        )
    );

    return forkJoin(projectSeeds);
  }

  private seedExperience(): Observable<any[]> {
    console.log('Seeding experience data...');
    const experienceSeeds = SEED_EXPERIENCE.map(exp => 
      this.firebaseDataSource.getById<Experience>('experience', exp.id!)
        .pipe(
          switchMap(existingExp => {
            if (existingExp) {
              console.log(`Experience ${exp.company} already exists, skipping...`);
              return of(existingExp);
            }
            return this.firebaseDataSource.create<Experience>('experience', exp as Experience);
          }),
          catchError(error => {
            console.error(`Error seeding experience ${exp.company}:`, error);
            return of(null);
          })
        )
    );

    return forkJoin(experienceSeeds);
  }

  private seedEducation(): Observable<any[]> {
    console.log('Seeding education data...');
    const educationSeeds = SEED_EDUCATION.map(edu => 
      this.firebaseDataSource.getById<Education>('education', edu.id!)
        .pipe(
          switchMap(existingEdu => {
            if (existingEdu) {
              console.log(`Education ${edu.institution} already exists, skipping...`);
              return of(existingEdu);
            }
            return this.firebaseDataSource.create<Education>('education', edu as Education);
          }),
          catchError(error => {
            console.error(`Error seeding education ${edu.institution}:`, error);
            return of(null);
          })
        )
    );

    return forkJoin(educationSeeds);
  }

  private seedTravel(): Observable<any[]> {
    console.log('Seeding travel data...');
    const travelSeeds = SEED_TRAVEL.map(travel => 
      this.firebaseDataSource.getById<Travel>('travel', travel.id!)
        .pipe(
          switchMap(existingTravel => {
            if (existingTravel) {
              console.log(`Travel ${travel.title} already exists, skipping...`);
              return of(existingTravel);
            }
            return this.firebaseDataSource.create<Travel>('travel', travel as Travel);
          }),
          catchError(error => {
            console.error(`Error seeding travel ${travel.title}:`, error);
            return of(null);
          })
        )
    );

    return forkJoin(travelSeeds);
  }

  // Method to check if data exists
  checkDataExists(): Observable<boolean> {
    return this.firebaseDataSource.getById<Profile>('profile', SEED_PROFILE.id!)
      .pipe(
        map(profile => !!profile),
        catchError(() => of(false))
      );
  }

  // Method to clear all seeded data (for development/testing)
  clearAllData(): Observable<boolean> {
    console.log('Clearing all seeded data...');
    
    const clearOperations = [
      ...SEED_PROJECTS.map(p => this.firebaseDataSource.delete('projects', p.id!)),
      ...SEED_EXPERIENCE.map(e => this.firebaseDataSource.delete('experience', e.id!)),
      ...SEED_EDUCATION.map(e => this.firebaseDataSource.delete('education', e.id!)),
      ...SEED_TRAVEL.map(t => this.firebaseDataSource.delete('travel', t.id!)),
      this.firebaseDataSource.delete('profile', SEED_PROFILE.id!)
    ];

    return forkJoin(clearOperations).pipe(
      map(() => {
        console.log('All seeded data cleared successfully!');
        return true;
      }),
      catchError(error => {
        console.error('Error clearing data:', error);
        return of(false);
      })
    );
  }
}
