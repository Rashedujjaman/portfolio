import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { GetProjectsUseCase } from '../../../domain/use-cases/project.use-case';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { DataSeedingService } from '../../../core/data-seeding-enhanced.service';
import { Project } from '../../../domain/entities/project.entity';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  profile: Profile | null = null;
  projects: Project[] = [];
  isLoading = true;
  isSeeding = false;
  isClearing = false;
  statusMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private getProjectsUseCase: GetProjectsUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private dataSeedingService: DataSeedingService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    // Load profile data
    this.getProfileUseCase.execute().subscribe({
      next: (profile) => {
        this.profile = profile;
        console.log('Profile loaded:', profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });

    // Load projects data
    this.getProjectsUseCase.execute().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        console.log('Projects loaded:', projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  seedData() {
    this.isSeeding = true;
    this.statusMessage = '';
    
    this.dataSeedingService.seedAllData().subscribe({
      next: (success) => {
        this.isSeeding = false;
        if (success) {
          this.statusMessage = 'Data seeded successfully! Refreshing dashboard...';
          setTimeout(() => {
            this.loadData();
          }, 2000);
        } else {
          this.statusMessage = 'Data seeding failed. Please check the console for details.';
        }
      },
      error: (error) => {
        this.isSeeding = false;
        this.statusMessage = `Data seeding error: ${error.message}`;
        console.error('Data seeding error:', error);
      }
    });
  }

  clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      this.isClearing = true;
      this.statusMessage = '';
      
      this.dataSeedingService.clearAllData().subscribe({
        next: (success) => {
          this.isClearing = false;
          if (success) {
            this.statusMessage = 'All data cleared successfully! Refreshing dashboard...';
            setTimeout(() => {
              this.loadData();
            }, 2000);
          } else {
            this.statusMessage = 'Data clearing failed. Please check the console for details.';
          }
        },
        error: (error) => {
          this.isClearing = false;
          this.statusMessage = `Data clearing error: ${error.message}`;
          console.error('Data clearing error:', error);
        }
      });
    }
  }

  checkDataStatus() {
    this.dataSeedingService.checkDataExists().subscribe({
      next: (exists) => {
        this.statusMessage = exists 
          ? 'Data exists in the database. Profile and initial data are configured.'
          : 'No data found in the database. Consider seeding initial data.';
      },
      error: (error) => {
        this.statusMessage = `Error checking data status: ${error.message}`;
        console.error('Data status check error:', error);
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  navigateToProjects() {
    this.router.navigate(['/admin/projects']);
  }

  navigateToProfile() {
    this.router.navigate(['/admin/profile']);
  }

  getFeaturedProjectsCount(): number {
    return this.projects.filter(project => project.featured).length;
  }

  getRecentActivityCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.projects.filter(project => 
      new Date(project.updatedAt) > oneWeekAgo
    ).length;
  }
}
