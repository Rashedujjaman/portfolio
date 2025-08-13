import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Travel as TravelEntity, Hobby } from '../../../domain/entities/lifestyle.entity';
import { TravelRepository, HobbyRepository } from '../../../domain/repositories/lifestyle.repository';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

/**
 * Travel (public) page component
 * ------------------------------------------------------------
 * Responsibilities:
 *  - Fetch profile, travel and hobby lifestyle data in parallel
 *  - Derive stats & featured subsets from a single load pass
 *  - Provide slideshow rotation for travel image sets
 *  - Drive scroll / parallax animations (lightweight custom logic)
 *  - Expose helpers for flags, formatting, counts & icons
 *  - Coordinate page-level loading state consumed by skeleton UI
 */

@Component({
  selector: 'app-travel',
  imports: [CommonModule, RouterModule],
  templateUrl: './travel.html',
  styleUrl: './travel.scss'
})
export class Travel implements OnInit, OnDestroy {
  // Data layer dependencies (DI)
  private readonly travelRepository = inject(TravelRepository);
  private readonly hobbyRepository = inject(HobbyRepository);
  private readonly getProfileUseCase = inject(GetProfileUseCase);
  private readonly elementRef = inject(ElementRef);

  // ---- Public state exposed to template ----
  profile: Profile | null = null;
  travels: TravelEntity[] = [];
  hobbies: Hobby[] = [];
  featuredTravels: TravelEntity[] = [];
  travelStats: TravelStats | null = null;
  hobbyStats: HobbyStats | null = null;
  visitedCountries: string[] = [];
  hoveredCountry: string | null = null;
  isLoading = true;                // Drives skeleton visibility
  selectedTravel: TravelEntity | null = null; // Modal selection
  currentImageIndex = 0;           // Active image inside modal gallery

  // ---- Internal slideshow state ----
  private currentImageIndices: Record<number, number> = {};  // Per-card current image index
  private slideshowIntervals: Record<number, ReturnType<typeof setInterval>> = {};

  // ---- Constants (tweakable) ----
  private static readonly SLIDESHOW_INTERVAL_MS = 4000;       // Rotation interval for card slideshows
  private static readonly SCROLL_VISIBILITY_OFFSET = 100;     // Trigger threshold for scroll animations

  // Lifecycle ------------------------------------------------
  ngOnInit(): void { this.loadData(); }

  ngOnDestroy(): void { this.clearSlideshows(); }

  // Listen to scroll to update parallax & reveal animations
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateParallaxEffects();
    this.updateScrollAnimations();
  }

  /**
   * Fetch all required data concurrently, then derive secondary state.
   * Uses Promise.all over RxJS to simplify single-fire load for this route.
   */
  private async loadData(): Promise<void> {
    try {
      const [profileResult, travelsResult, hobbiesResult] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.travelRepository.getTravels().toPromise(),
        this.hobbyRepository.getHobbies().toPromise()
      ]);

      // Primary datasets
      this.profile = profileResult ?? null;
      this.travels = travelsResult ?? [];
      this.hobbies = hobbiesResult ?? [];

      // Derived subsets & stats (computed once)
      this.featuredTravels = this.travels.filter(t => t.featured);
      this.travelStats = this.calculateTravelStats(this.travels);
      this.hobbyStats = this.calculateHobbyStats(this.hobbies);
      this.visitedCountries = [...new Set(this.travels.map(t => t.country))];

      // Initialize per-card slideshows after data is present
      this.initializeSlideshows();
    } catch (error) {
      console.error('[Travel] Error loading data', error);
    } finally {
      this.isLoading = false;
      // Defer scroll reveal to next tick to ensure DOM has rendered
      setTimeout(() => this.updateScrollAnimations(), 50);
    }
  }

  // ---- Derivation helpers ----------------------------------
  private calculateTravelStats(travels: TravelEntity[]): TravelStats {
    const countriesVisited = [...new Set(travels.map(t => t.country))];
    const citiesVisited = [...new Set(travels.map(t => t.city))];
    const totalDays = travels.reduce((sum, t) => sum + (t.duration || 0), 0);

    return {
      totalTravels: travels.length,
      totalCountries: countriesVisited.length,
      totalCities: citiesVisited.length,
      totalDays,
      countriesVisited,
      citiesVisited,
      averageTripDuration: travels.length ? Math.round(totalDays / travels.length) : 0
    };
  }

  private calculateHobbyStats(hobbies: Hobby[]): HobbyStats {
    const categories = [...new Set(hobbies.map(h => h.category))];
    const categoryBreakdown = hobbies.reduce<Record<string, number>>((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {});
    const withAchievements = hobbies.filter(h => (h.achievements?.length || 0) > 0);

    return {
      totalHobbies: hobbies.length,
      categories: categories.length,
      categoryBreakdown,
      featuredHobbies: hobbies.filter(h => h.featured).length,
      hobbiesWithAchievements: withAchievements.length,
      totalAchievements: withAchievements.reduce((sum, h) => sum + (h.achievements?.length || 0), 0)
    };
  }

  // ---- Visual & interaction helpers ------------------------
  private updateParallaxEffects(): void {
    const scrolled = window.pageYOffset;
    const parallaxElements = this.elementRef.nativeElement.querySelectorAll('.parallax-bg');
    parallaxElements.forEach((el: HTMLElement, idx: number) => {
      const speed = 0.1 + (idx * 0.02);
      el.style.transform = `translateY(${-(scrolled * speed)}px)`;
    });
  }

  private updateScrollAnimations(): void {
    const elements = this.elementRef.nativeElement.querySelectorAll('.scroll-animate');
    const winH = window.innerHeight;
    elements.forEach((el: HTMLElement) => {
      if (el.getBoundingClientRect().top < winH - Travel.SCROLL_VISIBILITY_OFFSET) {
        el.classList.add('visible');
      }
    });
  }

  // Travel interaction methods
  // ---- Modal interaction -----------------------------------
  selectTravel(travel: TravelEntity): void { this.selectedTravel = travel; this.currentImageIndex = 0; }

  closeModal(): void { this.selectedTravel = null; this.currentImageIndex = 0; }

  nextImage(): void {
    if (!this.selectedTravel?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedTravel.images.length;
  }

  prevImage(): void {
    if (!this.selectedTravel?.images?.length) return;
    this.currentImageIndex = this.currentImageIndex === 0
      ? this.selectedTravel.images.length - 1
      : this.currentImageIndex - 1;
  }

  // Helper methods
  // ---- Formatting & mapping helpers ------------------------
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Date not available';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  }

  getCountryFlag(country: string): string {
    const flagMap: { [key: string]: string } = {
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'canada': '🇨🇦',
      'mexico': '🇲🇽',
      'france': '🇫🇷',
      'germany': '🇩🇪',
      'italy': '🇮🇹',
      'spain': '🇪🇸',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'japan': '🎌',
      'china': '🇨🇳',
      'india': '🇮🇳',
      'australia': '🇦🇺',
      'malaysia': '🇲🇾',
      'nepal': '🇳🇵',
      'brazil': '🇧🇷',
      'thailand': '🇹🇭',
      'singapore': '🇸🇬',
      'south korea': '🇰🇷',
      'netherlands': '🇳🇱',
      'switzerland': '🇨🇭',
      'default': '🌍'
    };

    const lowerCountry = country.toLowerCase();
    return flagMap[lowerCountry] || flagMap['default'];
  }

  /**
   * Backwards compatibility helper for template bindings still using getTravelStats().
   * Prefer accessing travelStats directly where feasible.
   */
  getTravelStats(): { totalCountries: number; totalTrips: number; totalDays: number; featuredTrips: number } {
    if (!this.travelStats) {
      // Defensive: compute minimal subset on demand
      return {
        totalCountries: this.visitedCountries.length,
        totalTrips: this.travels.length,
        totalDays: this.travels.reduce((s, t) => s + (t.duration || 0), 0),
        featuredTrips: this.featuredTravels.length
      };
    }
    const { totalCountries, totalTravels, totalDays } = this.travelStats;
    return { totalCountries, totalTrips: totalTravels, totalDays, featuredTrips: this.featuredTravels.length };
  }

  getHobbyIcon(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'sports': '🏃‍♂️',
      'music': '🎵',
      'art': '🎨',
      'cooking': '👨‍🍳',
      'reading': '📚',
      'photography': '📸',
      'gaming': '🎮',
      'technology': '💻',
      'fitness': '💪',
      'travel': '✈️',
      'default': '🎯'
    };

    return categoryMap[category.toLowerCase()] || categoryMap['default'];
  }

  trackByTravel(_: number, travel: TravelEntity): string { return travel.id; }

  trackByHobby(_: number, hobby: Hobby): string { return hobby.id; }

  getCountryTripCount(country: string): number { return this.travels.filter(t => t.country === country).length; }

  getCountryTripText(country: string): string { return this.getCountryTripCount(country) === 1 ? 'trip' : 'trips'; }

  // Slideshow methods
  // ---- Slideshow logic -------------------------------------
  private initializeSlideshows(): void {
    this.clearSlideshows();
    this.travels.forEach((t, idx) => {
      if ((t.images?.length || 0) > 1) {
        this.currentImageIndices[idx] = 0;
        this.startSlideshow(idx, t.images!.length);
      }
    });
  }

  private clearSlideshows(): void {
    Object.values(this.slideshowIntervals).forEach(interval => interval && clearInterval(interval));
    this.slideshowIntervals = {};
    this.currentImageIndices = {};
  }

  private startSlideshow(cardIndex: number, imageCount: number): void {
    this.slideshowIntervals[cardIndex] = setInterval(() => {
      this.currentImageIndices[cardIndex] = (this.currentImageIndices[cardIndex] + 1) % imageCount;
    }, Travel.SLIDESHOW_INTERVAL_MS);
  }

  getCurrentImage(travel: TravelEntity, cardIndex: number): string {
    if (!travel.images?.length) return '/assets/images/placeholder-travel.jpg';
    const idx = this.currentImageIndices[cardIndex] ?? 0;
    return travel.images[idx] || '/assets/images/placeholder-travel.jpg';
  }

  getCurrentImageIndex(cardIndex: number): number { return this.currentImageIndices[cardIndex] ?? 0; }
}

// ---- Internal Interfaces ------------------------------------
interface TravelStats {
  totalTravels: number;
  totalCountries: number;
  totalCities: number;
  totalDays: number;
  countriesVisited: string[];
  citiesVisited: string[];
  averageTripDuration: number;
}

interface HobbyStats {
  totalHobbies: number;
  categories: number; // count of unique categories
  categoryBreakdown: Record<string, number>;
  featuredHobbies: number;
  hobbiesWithAchievements: number;
  totalAchievements: number;
}
