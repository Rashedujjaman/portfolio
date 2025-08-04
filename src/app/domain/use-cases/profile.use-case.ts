import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../entities/profile.entity';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProfileUseCase {
  private profileRepository = inject(ProfileRepository);

  execute(): Observable<Profile | null> {
    return this.profileRepository.getProfile();
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateProfileUseCase {
  private profileRepository = inject(ProfileRepository);

  execute(profile: Profile): Observable<Profile> {
    return this.profileRepository.updateProfile(profile);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CreateProfileUseCase {
  private profileRepository = inject(ProfileRepository);

  execute(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Observable<Profile> {
    return this.profileRepository.createProfile(profile);
  }
}
