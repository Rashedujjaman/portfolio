import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../../domain/entities/profile.entity';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { FirebaseDataSource } from '../datasources/firebase.datasource';

@Injectable({
  providedIn: 'root'
})
export class ProfileRepositoryImpl extends ProfileRepository {
  private readonly COLLECTION_NAME = 'profile';
  private firebaseDataSource = inject(FirebaseDataSource);

  constructor() {
    super();
  }

  getProfile(): Observable<Profile | null> {
    // For a personal portfolio, we'll assume there's only one profile with a specific ID
    const profileId = 'nEK3NNwDCT2zZ3mq5b1B';
    return this.firebaseDataSource.getById<Profile>(this.COLLECTION_NAME, profileId);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.firebaseDataSource.update<Profile>(this.COLLECTION_NAME, profile.id, profile);
  }

  createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Observable<Profile> {
    return this.firebaseDataSource.create<Profile>(this.COLLECTION_NAME, profile);
  }
}
