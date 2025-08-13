import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../../../domain/entities/profile.entity';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { ThemeService, ThemeMode } from '../../../core/theme.service';

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
  theme: ThemeMode = 'light';

  private getProfileUseCase = inject(GetProfileUseCase);

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.loadProfile();
    this.theme = this.themeService.getTheme();
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(t => this.theme = t);
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
