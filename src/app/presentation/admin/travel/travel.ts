import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Travel } from '../../../domain/entities/lifestyle.entity';
import { TravelRepository } from '../../../domain/repositories/lifestyle.repository';

@Component({
  selector: 'app-admin-travel',
  imports: [CommonModule],
  templateUrl: './travel.html',
  styleUrl: './travel.scss'
})
export class AdminTravel implements OnInit, OnDestroy {
  travels: Travel[] = [];
  isLoading = true;

  // Image slideshow management
  private currentImageIndices: { [cardIndex: number]: number } = {};
  private slideshowIntervals: { [cardIndex: number]: any } = {};
  private readonly SLIDESHOW_INTERVAL = 3000; // 3 seconds

  constructor(
    private router: Router,
    private travelRepository: TravelRepository
  ) {}

  ngOnInit() {
    this.loadTravels();
  }

  ngOnDestroy() {
    // Clean up all intervals
    Object.values(this.slideshowIntervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });
  }

  private loadTravels() {
    this.isLoading = true;
    this.travelRepository.getTravels().subscribe({
      next: (travels) => {
        this.travels = travels;
        this.isLoading = false;
        // Initialize slideshows for each travel card
        this.initializeSlideshows();
      },
      error: (error) => {
        console.error('Error loading travels:', error);
        this.isLoading = false;
      }
    });
  }

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

  getCurrentImage(travel: Travel, cardIndex: number): string {
    if (!travel.images || travel.images.length === 0) {
      return '/assets/images/placeholder-travel.jpg';
    }
    
    const currentIndex = this.currentImageIndices[cardIndex] || 0;
    return travel.images[currentIndex] || '/assets/images/placeholder-travel.jpg';
  }

  getCurrentImageIndex(cardIndex: number): number {
    return this.currentImageIndices[cardIndex] || 0;
  }

  createTravel() {
    this.router.navigate(['/admin/travel/new']);
  }

  editTravel(travel: Travel) {
    this.router.navigate(['/admin/travel/edit', travel.id]);
  }

  deleteTravel(travel: Travel) {
    if (confirm(`Are you sure you want to delete "${travel.title}"?`)) {
      this.travelRepository.deleteTravel(travel.id).subscribe({
        next: () => {
          this.loadTravels();
        },
        error: (error) => {
          console.error('Error deleting travel:', error);
          alert('Error deleting travel. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Date not available';
    
    try {
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        return 'Invalid date';
      }
      
      return validDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'Date unavailable';
    }
  }

  getTotalTravels(): number {
    return this.travels.length;
  }

  getFeaturedTravels(): number {
    return this.travels.filter(travel => travel.featured).length;
  }

  getTotalCountries(): number {
    return [...new Set(this.travels.map(travel => travel.country))].length;
  }

  getTotalDays(): number {
    return this.travels.reduce((total, travel) => total + travel.duration, 0);
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

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://t4.ftcdn.net/jpg/00/65/48/25/360_F_65482539_C0ZozE5gUjCafz7Xq98WB4dW6LAhqKfs.jpg';
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
