import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Travel, Hobby, HobbyCategory } from '../entities/lifestyle.entity';
import { TravelRepository, HobbyRepository } from '../repositories/lifestyle.repository';

// Travel Use Cases
@Injectable({
  providedIn: 'root'
})
export class GetTravelsUseCase {
  private travelRepository = inject(TravelRepository);

  execute(): Observable<Travel[]> {
    return this.travelRepository.getTravels();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTravelByIdUseCase {
  private travelRepository = inject(TravelRepository);

  execute(id: string): Observable<Travel | null> {
    return this.travelRepository.getTravel(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetFeaturedTravelsUseCase {
  private travelRepository = inject(TravelRepository);

  execute(): Observable<Travel[]> {
    return this.travelRepository.getFeaturedTravels();
  }
}

@Injectable({
  providedIn: 'root'
})
export class AddTravelUseCase {
  private travelRepository = inject(TravelRepository);

  execute(travel: Omit<Travel, 'id' | 'createdAt' | 'updatedAt'>): Observable<Travel> {
    return this.travelRepository.createTravel(travel);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateTravelUseCase {
  private travelRepository = inject(TravelRepository);

  execute(id: string, travel: Partial<Travel>): Observable<Travel> {
    return this.travelRepository.updateTravel(id, travel);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteTravelUseCase {
  private travelRepository = inject(TravelRepository);

  execute(id: string): Observable<void> {
    return this.travelRepository.deleteTravel(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTravelStatsUseCase {
  private travelRepository = inject(TravelRepository);

  execute(): Observable<{
    totalTravels: number;
    totalCountries: number;
    totalCities: number;
    totalDays: number;
    countriesVisited: string[];
    citiesVisited: string[];
    averageTripDuration: number;
  }> {
    return this.travelRepository.getTravels().pipe(
      map(travels => {
        const countries = new Set(travels.map(t => t.country));
        const cities = new Set(travels.map(t => `${t.city}, ${t.country}`));
        const totalDays = travels.reduce((sum, travel) => sum + (travel.duration || 0), 0);

        return {
          totalTravels: travels.length,
          totalCountries: countries.size,
          totalCities: cities.size,
          totalDays,
          countriesVisited: Array.from(countries),
          citiesVisited: Array.from(cities),
          averageTripDuration: travels.length > 0 ? totalDays / travels.length : 0
        };
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetTravelsByCountryUseCase {
  private travelRepository = inject(TravelRepository);

  execute(country: string): Observable<Travel[]> {
    return this.travelRepository.getTravels().pipe(
      map(travels => travels.filter(travel => 
        travel.country.toLowerCase() === country.toLowerCase()
      ))
    );
  }
}

// Hobby Use Cases
@Injectable({
  providedIn: 'root'
})
export class GetHobbiesUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(): Observable<Hobby[]> {
    return this.hobbyRepository.getHobbies();
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetHobbyByIdUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(id: string): Observable<Hobby | null> {
    return this.hobbyRepository.getHobby(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetFeaturedHobbiesUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(): Observable<Hobby[]> {
    return this.hobbyRepository.getFeaturedHobbies();
  }
}

@Injectable({
  providedIn: 'root'
})
export class AddHobbyUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(hobby: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt'>): Observable<Hobby> {
    return this.hobbyRepository.createHobby(hobby);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateHobbyUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(id: string, hobby: Partial<Hobby>): Observable<Hobby> {
    return this.hobbyRepository.updateHobby(id, hobby);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeleteHobbyUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(id: string): Observable<void> {
    return this.hobbyRepository.deleteHobby(id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetHobbiesByCategoryUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(category: HobbyCategory): Observable<Hobby[]> {
    return this.hobbyRepository.getHobbies().pipe(
      map(hobbies => hobbies.filter(hobby => hobby.category === category))
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GetHobbyStatsUseCase {
  private hobbyRepository = inject(HobbyRepository);

  execute(): Observable<{
    totalHobbies: number;
    categoryCounts: { [key: string]: number };
    featuredCount: number;
    oldestHobby?: Hobby;
    newestHobby?: Hobby;
  }> {
    return this.hobbyRepository.getHobbies().pipe(
      map(hobbies => {
        const categoryCounts: { [key: string]: number } = {};
        
        hobbies.forEach(hobby => {
          categoryCounts[hobby.category] = (categoryCounts[hobby.category] || 0) + 1;
        });

        const hobbiesWithStartDate = hobbies.filter(h => h.startedDate);
        const sortedByDate = hobbiesWithStartDate.sort((a, b) => {
          const dateA = a.startedDate ? new Date(a.startedDate).getTime() : 0;
          const dateB = b.startedDate ? new Date(b.startedDate).getTime() : 0;
          return dateA - dateB;
        });

        return {
          totalHobbies: hobbies.length,
          categoryCounts,
          featuredCount: hobbies.filter(h => h.featured).length,
          oldestHobby: sortedByDate.length > 0 ? sortedByDate[0] : undefined,
          newestHobby: sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : undefined
        };
      })
    );
  }
}
