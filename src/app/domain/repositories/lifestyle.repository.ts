import { Observable } from 'rxjs';
import { Travel, Hobby } from '../entities/lifestyle.entity';

export abstract class TravelRepository {
  abstract getTravels(): Observable<Travel[]>;
  abstract getTravel(id: string): Observable<Travel | null>;
  abstract getFeaturedTravels(): Observable<Travel[]>;
  abstract createTravel(travel: Omit<Travel, 'id' | 'createdAt' | 'updatedAt'>): Observable<Travel>;
  abstract updateTravel(id: string, travel: Partial<Travel>): Observable<Travel>;
  abstract deleteTravel(id: string): Observable<void>;
}

export abstract class HobbyRepository {
  abstract getHobbies(): Observable<Hobby[]>;
  abstract getHobby(id: string): Observable<Hobby | null>;
  abstract getFeaturedHobbies(): Observable<Hobby[]>;
  abstract createHobby(hobby: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt'>): Observable<Hobby>;
  abstract updateHobby(id: string, hobby: Partial<Hobby>): Observable<Hobby>;
  abstract deleteHobby(id: string): Observable<void>;
}
