import { Component, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Travel as TravelEntity, Hobby } from '../../../domain/entities/lifestyle.entity';
import { TravelRepository, HobbyRepository } from '../../../domain/repositories/lifestyle.repository';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { 
  GetTravelsUseCase, 
  GetFeaturedTravelsUseCase, 
  GetTravelStatsUseCase,
  GetHobbiesUseCase,
  GetFeaturedHobbiesUseCase,
  GetHobbyStatsUseCase 
} from '../../../domain/use-cases/lifestyle.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-travel',
  imports: [CommonModule, RouterModule],
  templateUrl: './travel.html',
  styleUrl: './travel.scss'
})
export class Travel implements OnInit {
  private travelRepository = inject(TravelRepository);
  private hobbyRepository = inject(HobbyRepository);
  private getProfileUseCase = inject(GetProfileUseCase);
  private getTravelsUseCase = inject(GetTravelsUseCase);
  private getFeaturedTravelsUseCase = inject(GetFeaturedTravelsUseCase);
  private getTravelStatsUseCase = inject(GetTravelStatsUseCase);
  private getHobbiesUseCase = inject(GetHobbiesUseCase);
  private getFeaturedHobbiesUseCase = inject(GetFeaturedHobbiesUseCase);
  private getHobbyStatsUseCase = inject(GetHobbyStatsUseCase);
  private elementRef = inject(ElementRef);

  profile: Profile | null = null;
  travels: TravelEntity[] = [];
  hobbies: Hobby[] = [];
  featuredTravels: TravelEntity[] = [];
  travelStats: any = null;
  hobbyStats: any = null;
  isLoading = true;
  selectedTravel: TravelEntity | null = null;
  currentImageIndex = 0;

  // Map and interaction states
  hoveredCountry: string | null = null;
  visitedCountries: string[] = [];

  ngOnInit() {
    this.loadData();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateParallaxEffects();
    this.updateScrollAnimations();
  }

  private async loadData() {
    try {
      const [
        profileResult, 
        travelsResult, 
        hobbiesResult, 
        featuredTravelsResult,
        travelStatsResult,
        hobbyStatsResult
      ] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.getTravelsUseCase.execute().toPromise(),
        this.getHobbiesUseCase.execute().toPromise(),
        this.getFeaturedTravelsUseCase.execute().toPromise(),
        this.getTravelStatsUseCase.execute().toPromise(),
        this.getHobbyStatsUseCase.execute().toPromise()
      ]);

      this.profile = profileResult || null;
      this.travels = travelsResult || [];
      this.hobbies = hobbiesResult || [];
      this.featuredTravels = featuredTravelsResult || [];
      this.travelStats = travelStatsResult;
      this.hobbyStats = hobbyStatsResult;
      
      // Extract visited countries
      this.visitedCountries = [...new Set(this.travels.map(travel => travel.country))];
    } catch (error) {
      console.error('Error loading travel data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateParallaxEffects() {
    const scrolled = window.pageYOffset;
    const parallaxElements = this.elementRef.nativeElement.querySelectorAll('.parallax-bg');
    
    parallaxElements.forEach((element: HTMLElement, index: number) => {
      const speed = 0.1 + (index * 0.02);
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  private updateScrollAnimations() {
    const elements = this.elementRef.nativeElement.querySelectorAll('.scroll-animate');
    const windowHeight = window.innerHeight;
    
    elements.forEach((element: HTMLElement) => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('visible');
      }
    });
  }

  // Travel interaction methods
  selectTravel(travel: TravelEntity) {
    this.selectedTravel = travel;
    this.currentImageIndex = 0;
  }

  closeModal() {
    this.selectedTravel = null;
    this.currentImageIndex = 0;
  }

  nextImage() {
    if (this.selectedTravel && this.selectedTravel.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedTravel.images.length;
    }
  }

  prevImage() {
    if (this.selectedTravel && this.selectedTravel.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedTravel.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  // Helper methods
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
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
      'japan': '🇯🇵',
      'china': '🇨🇳',
      'india': '🇮🇳',
      'australia': '🇦🇺',
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

  getTravelStats() {
    return {
      totalCountries: this.visitedCountries.length,
      totalTrips: this.travels.length,
      totalDays: this.travels.reduce((sum, travel) => sum + travel.duration, 0),
      featuredTrips: this.featuredTravels.length
    };
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

  trackByTravel(index: number, travel: TravelEntity): string {
    return travel.id;
  }

  trackByHobby(index: number, hobby: Hobby): string {
    return hobby.id;
  }

  getCountryTripCount(country: string): number {
    return this.travels.filter(travel => travel.country === country).length;
  }

  getCountryTripText(country: string): string {
    const count = this.getCountryTripCount(country);
    return count === 1 ? 'trip' : 'trips';
  }
}
