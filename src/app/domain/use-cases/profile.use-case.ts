import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../entities/profile.entity';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProfileUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  execute(): Observable<Profile | null> {
    return this.profileRepository.getProfile();
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateProfileUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  execute(profile: Profile): Observable<Profile> {
    return this.profileRepository.updateProfile(profile);
  }
}
