import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Travel as TravelEntity, Hobby } from '../../../domain/entities/lifestyle.entity';
import { TravelRepository, HobbyRepository } from '../../../domain/repositories/lifestyle.repository';
import { GetProfileUseCase } from '../../../domain/use-cases/profile.use-case';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-travel',
  imports: [CommonModule, RouterModule],
  templateUrl: './travel.html',
  styleUrl: './travel.scss'
})
export class Travel implements OnInit, OnDestroy {
  private travelRepository = inject(TravelRepository);
  private hobbyRepository = inject(HobbyRepository);
  private getProfileUseCase = inject(GetProfileUseCase);
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

  // Image slideshow management
  private currentImageIndices: { [cardIndex: number]: number } = {};
  private slideshowIntervals: { [cardIndex: number]: any } = {};
  private readonly SLIDESHOW_INTERVAL = 4000; // 4 seconds for user page

  // Map and interaction states
  hoveredCountry: string | null = null;
  visitedCountries: string[] = [];

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    // Clean up all intervals
    Object.values(this.slideshowIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateParallaxEffects();
    this.updateScrollAnimations();
  }

  private async loadData() {
    try {
      const [profileResult, travelsResult, hobbiesResult] = await Promise.all([
        this.getProfileUseCase.execute().toPromise(),
        this.travelRepository.getTravels().toPromise(),
        this.hobbyRepository.getHobbies().toPromise()
      ]);

      this.profile = profileResult || null;
      this.travels = travelsResult || [];
      this.hobbies = hobbiesResult || [];
      
      // Calculate derived data from the single database calls
      this.featuredTravels = this.travels.filter(travel => travel.featured);
      this.travelStats = this.calculateTravelStats(this.travels);
      this.hobbyStats = this.calculateHobbyStats(this.hobbies);
      
      // Extract visited countries
      this.visitedCountries = [...new Set(this.travels.map(travel => travel.country))];
      
      // Initialize slideshows after data is loaded
      this.initializeSlideshows();
    } catch (error) {
      console.error('Error loading travel data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private calculateTravelStats(travels: TravelEntity[]) {
    const countriesVisited = [...new Set(travels.map(t => t.country))];
    const citiesVisited = [...new Set(travels.map(t => t.city))];
    const totalDays = travels.reduce((sum, travel) => sum + travel.duration, 0);
    
    return {
      totalTravels: travels.length,
      totalCountries: countriesVisited.length,
      totalCities: citiesVisited.length,
      totalDays,
      countriesVisited,
      citiesVisited,
      averageTripDuration: travels.length > 0 ? Math.round(totalDays / travels.length) : 0
    };
  }

  private calculateHobbyStats(hobbies: Hobby[]) {
    const categories = [...new Set(hobbies.map(h => h.category))];
    
    const categoryBreakdown = hobbies.reduce((acc, hobby) => {
      acc[hobby.category] = (acc[hobby.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const hobbiesWithAchievements = hobbies.filter(h => h.achievements && h.achievements.length > 0);

    return {
      totalHobbies: hobbies.length,
      categories: categories.length,
      categoryBreakdown,
      featuredHobbies: hobbies.filter(h => h.featured).length,
      hobbiesWithAchievements: hobbiesWithAchievements.length,
      totalAchievements: hobbiesWithAchievements.reduce((sum, h) => sum + (h.achievements?.length || 0), 0)
    };
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
    if (this.selectedTravel && this.selectedTravel.images && this.selectedTravel.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedTravel.images.length;
    }
  }

  prevImage() {
    if (this.selectedTravel && this.selectedTravel.images && this.selectedTravel.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedTravel.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  // Helper methods
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Date not available';
    
    try {
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      }).format(validDate);
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'Date unavailable';
    }
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

  // Slideshow methods
  private initializeSlideshows() {
    // Clear existing intervals
    Object.values(this.slideshowIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    this.slideshowIntervals = {};
    this.currentImageIndices = {};

    // Initialize slideshow for each travel card
    this.travels.forEach((travel, cardIndex) => {
      if (travel.images && travel.images.length > 1) {
        this.currentImageIndices[cardIndex] = 0;
        this.startSlideshow(cardIndex, travel.images.length);
      }
    });
  }

  private startSlideshow(cardIndex: number, imageCount: number) {
    this.slideshowIntervals[cardIndex] = setInterval(() => {
      this.currentImageIndices[cardIndex] = (this.currentImageIndices[cardIndex] + 1) % imageCount;
    }, this.SLIDESHOW_INTERVAL);
  }

  getCurrentImage(travel: TravelEntity, cardIndex: number): string {
    if (!travel.images || travel.images.length === 0) {
      return '/assets/images/placeholder-travel.jpg';
    }
    
    const currentIndex = this.currentImageIndices[cardIndex] || 0;
    return travel.images[currentIndex] || '/assets/images/placeholder-travel.jpg';
  }

  getCurrentImageIndex(cardIndex: number): number {
    return this.currentImageIndices[cardIndex] || 0;
  }
}
