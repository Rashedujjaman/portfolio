import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminSetupService {
  // This URL will be your Firebase Cloud Function URL after deployment
  private readonly baseUrl = 'https://us-central1-rdjportfolio.cloudfunctions.net';

  constructor(private http: HttpClient) {}

  setAdminClaim(email: string, isAdmin: boolean = true): Observable<any> {
    return this.http.post(`${this.baseUrl}/setAdminClaimHTTP`, {
      email,
      isAdmin
    });
  }

  listUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/listUsers`);
  }
}
