import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../../../domain/entities/profile.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class Navigation implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isMenuOpen = false;
  profile: Profile | null = null;

  constructor(private getProfileUseCase: GetProfileUseCase) {}

  ngOnInit() {
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile() {
    this.getProfileUseCase.execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
        },
        error: (error) => {
          console.error('Error loading profile for navigation:', error);
        }
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
