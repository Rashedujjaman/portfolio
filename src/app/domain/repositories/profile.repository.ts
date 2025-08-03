import { Observable } from 'rxjs';
import { Profile } from '../entities/profile.entity';

export abstract class ProfileRepository {
  abstract getProfile(): Observable<Profile | null>;
  abstract updateProfile(profile: Profile): Observable<Profile>;
  abstract createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Observable<Profile>;
}
