import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TravelRepository, HobbyRepository } from '../../domain/repositories/lifestyle.repository';
import { Travel as TravelEntity, Hobby } from '../../domain/entities/lifestyle.entity';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class TravelRepositoryImpl implements TravelRepository {
  private readonly COLLECTION_NAME = 'travel';
  private firebaseDataSource = inject(FirebaseDataSource);

  getTravels(): Observable<TravelEntity[]> {
    return this.firebaseDataSource.getAll<TravelEntity>(this.COLLECTION_NAME, [
      this.firebaseDataSource.createOrderByCondition('visitDate', 'desc')
    ]);
  }

  getTravel(id: string): Observable<TravelEntity | null> {
    return this.firebaseDataSource.getById<TravelEntity>(this.COLLECTION_NAME, id);
  }

  getFeaturedTravels(): Observable<TravelEntity[]> {
    return this.firebaseDataSource.getAll<TravelEntity>(this.COLLECTION_NAME, [
      this.firebaseDataSource.createWhereCondition('featured', '==', true),
      this.firebaseDataSource.createOrderByCondition('visitDate', 'desc')
    ]);
  }

  createTravel(travel: Omit<TravelEntity, 'id' | 'createdAt' | 'updatedAt'>): Observable<TravelEntity> {
    return this.firebaseDataSource.create<TravelEntity>(this.COLLECTION_NAME, travel);
  }

  updateTravel(id: string, travel: Partial<TravelEntity>): Observable<TravelEntity> {
    return this.firebaseDataSource.update<TravelEntity>(this.COLLECTION_NAME, id, travel);
  }

  deleteTravel(id: string): Observable<void> {
    return this.firebaseDataSource.delete(this.COLLECTION_NAME, id);
  }
}

@Injectable({
  providedIn: 'root'
})
export class HobbyRepositoryImpl implements HobbyRepository {
  private firebaseDataSource = inject(FirebaseDataSource);

  getHobbies(): Observable<Hobby[]> {
    return this.firebaseDataSource.getAll<Hobby>('hobbies', [
      this.firebaseDataSource.createOrderByCondition('name', 'asc')
    ]);
  }

  getHobby(id: string): Observable<Hobby | null> {
    return this.firebaseDataSource.getById<Hobby>('hobbies', id);
  }

  getFeaturedHobbies(): Observable<Hobby[]> {
    return this.firebaseDataSource.getAll<Hobby>('hobbies', [
      this.firebaseDataSource.createWhereCondition('featured', '==', true),
      this.firebaseDataSource.createOrderByCondition('name', 'asc')
    ]);
  }

  createHobby(hobby: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt'>): Observable<Hobby> {
    return this.firebaseDataSource.create<Hobby>('hobbies', hobby);
  }

  updateHobby(id: string, hobby: Partial<Hobby>): Observable<Hobby> {
    return this.firebaseDataSource.update<Hobby>('hobbies', id, hobby);
  }

  deleteHobby(id: string): Observable<void> {
    return this.firebaseDataSource.delete('hobbies', id);
  }
}
