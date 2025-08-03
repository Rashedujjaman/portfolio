import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { firebaseConfig } from '../environments/firebase.config';

// Repository providers
import { ProfileRepository } from './domain/repositories/profile.repository';
import { ProjectRepository } from './domain/repositories/project.repository';
import { ExperienceRepository } from './domain/repositories/experience.repository';
import { TravelRepository, HobbyRepository } from './domain/repositories/lifestyle.repository';
import { ProfileRepositoryImpl } from './data/repositories/profile-repository.impl';
import { ProjectRepositoryImpl } from './data/repositories/project-repository.impl';
import { ExperienceRepositoryImpl } from './data/repositories/experience-repository.impl';
import { TravelRepositoryImpl, HobbyRepositoryImpl } from './data/repositories/lifestyle-repository.impl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    
    // Firebase providers
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    
    // Repository implementations
    { provide: ProfileRepository, useClass: ProfileRepositoryImpl },
    { provide: ProjectRepository, useClass: ProjectRepositoryImpl },
    { provide: ExperienceRepository, useClass: ExperienceRepositoryImpl },
    { provide: TravelRepository, useClass: TravelRepositoryImpl },
    { provide: HobbyRepository, useClass: HobbyRepositoryImpl }
  ]
};
