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
import { ExperienceRepository, EducationRepository } from './domain/repositories/experience.repository';
import { TravelRepository, HobbyRepository } from './domain/repositories/lifestyle.repository';
import { BlogRepository, TestimonialRepository } from './domain/repositories/content.repository';
import { ProfileRepositoryImpl } from './data/repositories/profile-repository.impl';
import { ProjectRepositoryImpl } from './data/repositories/project-repository.impl';
import { ExperienceRepositoryImpl } from './data/repositories/experience-repository.impl';
import { EducationRepositoryImpl } from './data/repositories/education-repository.impl';
import { TravelRepositoryImpl, HobbyRepositoryImpl } from './data/repositories/lifestyle-repository.impl';
import { BlogRepositoryImpl, TestimonialRepositoryImpl } from './data/repositories/content-repository.impl';

// Use case providers
import { GetProfileUseCase } from './domain/use-cases/profile.use-case';
import { GetProjectsUseCase } from './domain/use-cases/project.use-case';
import { GetExperiencesUseCase,} from './domain/use-cases/experience.use-case';
import { GetEducationsUseCase, GetEducationStatsUseCase } from './domain/use-cases/education.use-case';
import { 
  GetTravelsUseCase, 
  GetHobbiesUseCase, 
  GetTravelStatsUseCase 
} from './domain/use-cases/lifestyle.use-case';
import { 
  GetBlogPostsUseCase, 
  GetTestimonialsUseCase 
} from './domain/use-cases/content.use-case';
import { 
  SubmitContactFormUseCase, 
  ValidateContactFormUseCase 
} from './domain/use-cases/contact.use-case';

// Core services
import { DataSeedingService } from './core/data-seeding.service';

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
    { provide: EducationRepository, useClass: EducationRepositoryImpl },
    { provide: TravelRepository, useClass: TravelRepositoryImpl },
    { provide: HobbyRepository, useClass: HobbyRepositoryImpl },
    { provide: BlogRepository, useClass: BlogRepositoryImpl },
    { provide: TestimonialRepository, useClass: TestimonialRepositoryImpl },

    // Use case providers
    GetProfileUseCase,
    GetProjectsUseCase,
    GetExperiencesUseCase,
    GetEducationsUseCase,
    GetEducationStatsUseCase,
    GetTravelsUseCase,
    GetHobbiesUseCase,
    GetTravelStatsUseCase,
    GetBlogPostsUseCase,
    GetTestimonialsUseCase,
    SubmitContactFormUseCase,
    ValidateContactFormUseCase,

    // Core services
    DataSeedingService
  ]
};
