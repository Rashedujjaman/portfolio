import { Injectable } from '@angular/core';
import { FirebaseDataSource } from '../data/datasources/firebase.datasource';
import { Profile } from '../domain/entities/profile.entity';
import { Project, ProjectCategory, ProjectStatus } from '../domain/entities/project.entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSeedingService {
  constructor(private firebaseDataSource: FirebaseDataSource) {}

  seedInitialData(): Observable<any> {
    return new Observable(observer => {
      this.seedProfile().then(() => {
        return this.seedProjects();
      }).then(() => {
        observer.next('Data seeding completed successfully');
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  private async seedProfile(): Promise<void> {
    const sampleProfile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'John Doe',
      title: 'Full Stack Software Engineer',
      bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. I love creating innovative solutions and exploring new technologies.',
      profileImage: 'https://via.placeholder.com/400x400?text=Profile+Image',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      socialLinks: [
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', icon: 'linkedin' },
        { platform: 'GitHub', url: 'https://github.com/johndoe', icon: 'github' },
        { platform: 'Twitter', url: 'https://twitter.com/johndoe', icon: 'twitter' }
      ],
      skills: ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Python', 'Firebase', 'AWS'],
      languages: ['English', 'Spanish', 'French'],
      resumeUrl: 'https://example.com/resume.pdf'
    };

    try {
      await this.firebaseDataSource.create<Profile>('profile', sampleProfile).toPromise();
      console.log('Profile seeded successfully');
    } catch (error) {
      console.error('Error seeding profile:', error);
    }
  }

  private async seedProjects(): Promise<void> {
    const sampleProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform built with Angular and Node.js, featuring real-time inventory management, secure payment processing, and responsive design.',
        shortDescription: 'Full-stack e-commerce platform with real-time features',
        images: [
          'https://via.placeholder.com/800x600?text=E-Commerce+Screenshot+1',
          'https://via.placeholder.com/800x600?text=E-Commerce+Screenshot+2'
        ],
        technologies: ['Angular', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
        githubUrl: 'https://github.com/johndoe/ecommerce-platform',
        liveUrl: 'https://ecommerce-demo.example.com',
        category: ProjectCategory.WEB_APPLICATION,
        featured: true,
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-06-30'),
        status: ProjectStatus.COMPLETED,
        challenges: 'Implementing real-time inventory updates and ensuring secure payment processing',
        solutions: 'Used WebSockets for real-time updates and integrated Stripe for secure payments'
      },
      {
        title: 'Task Management Mobile App',
        description: 'Cross-platform mobile application for task management with offline capabilities, built using React Native and Firebase.',
        shortDescription: 'Cross-platform task management app with offline support',
        images: [
          'https://via.placeholder.com/400x800?text=Mobile+App+Screenshot+1',
          'https://via.placeholder.com/400x800?text=Mobile+App+Screenshot+2'
        ],
        technologies: ['React Native', 'Firebase', 'Redux', 'AsyncStorage'],
        githubUrl: 'https://github.com/johndoe/task-manager-app',
        category: ProjectCategory.MOBILE_APP,
        featured: true,
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-10-15'),
        status: ProjectStatus.COMPLETED,
        challenges: 'Implementing offline functionality and data synchronization',
        solutions: 'Used AsyncStorage for offline data and Firebase for cloud sync'
      },
      {
        title: 'Weather API Service',
        description: 'RESTful API service providing weather data with caching, rate limiting, and comprehensive documentation.',
        shortDescription: 'RESTful weather API with caching and rate limiting',
        images: [
          'https://via.placeholder.com/800x600?text=API+Documentation'
        ],
        technologies: ['Node.js', 'Express', 'Redis', 'PostgreSQL', 'Swagger'],
        githubUrl: 'https://github.com/johndoe/weather-api',
        liveUrl: 'https://weather-api.example.com',
        category: ProjectCategory.API,
        featured: false,
        startDate: new Date('2023-11-01'),
        status: ProjectStatus.IN_PROGRESS,
        challenges: 'Implementing efficient caching strategies and handling high traffic',
        solutions: 'Used Redis for caching and implemented request throttling'
      }
    ];

    for (const project of sampleProjects) {
      try {
        await this.firebaseDataSource.create<Project>('projects', project).toPromise();
        console.log(`Project "${project.title}" seeded successfully`);
      } catch (error) {
        console.error(`Error seeding project "${project.title}":`, error);
      }
    }
  }
}
