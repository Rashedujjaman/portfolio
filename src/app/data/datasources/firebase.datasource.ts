import { Injectable, inject, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  increment 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataSource {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  // Helper method to remove undefined values from objects
  private cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item));
    }
    
    if (typeof obj === 'object' && obj.constructor === Object) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  // Generic CRUD operations
  create<T>(collectionName: string, data: any): Observable<T> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const collectionRef = collection(this.firestore, collectionName);
          const timestamp = Timestamp.now();
          const cleanedData = this.cleanUndefinedValues(data);
          const docData = {
            ...cleanedData,
            createdAt: timestamp,
            updatedAt: timestamp
          };
          
          const docRef = await addDoc(collectionRef, docData);
          observer.next({ ...docData, id: docRef.id } as T);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  private convertTimestamps(data: any): any {
    if (!data) return data;
    
    const converted = { ...data };
    
    // Convert common timestamp fields
    const timestampFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'date', 'visitDate'];
    
    timestampFields.forEach(field => {
      if (converted[field] && typeof converted[field].toDate === 'function') {
        converted[field] = converted[field].toDate();
      }
    });
    
    return converted;
  }

  getById<T>(collectionName: string, id: string): Observable<T | null> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          const snapshot = await getDoc(docRef);
          
          if (snapshot.exists()) {
            const data = snapshot.data();
            const converted = this.convertTimestamps(data);
            observer.next({
              ...converted,
              id: snapshot.id
            } as T);
          } else {
            observer.next(null);
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  getAll<T>(collectionName: string, conditions?: any[]): Observable<T[]> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const collectionRef = collection(this.firestore, collectionName);
          let q = query(collectionRef);
          
          if (conditions) {
            conditions.forEach(condition => {
              q = query(q, condition);
            });
          }
          
          const snapshot = await getDocs(q);
          const results = snapshot.docs.map(doc => {
            const data = doc.data();
            const converted = this.convertTimestamps(data);
            return {
              ...converted,
              id: doc.id
            } as T;
          });
          
          observer.next(results);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  update<T>(collectionName: string, id: string, data: Partial<T>): Observable<T> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          const cleanedData = this.cleanUndefinedValues(data);
          const updateData = {
            ...cleanedData,
            updatedAt: Timestamp.now()
          };
          
          await updateDoc(docRef, updateData);
          observer.next({ ...data, id } as T);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  delete(collectionName: string, id: string): Observable<void> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          await deleteDoc(docRef);
          observer.next();
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  increment(collectionName: string, id: string, field: string, value: number): Observable<void> {
    return new Observable(observer => {
      runInInjectionContext(this.injector, async () => {
        try {
          const docRef = doc(this.firestore, collectionName, id);
          const updateData = {
            [field]: increment(value),
            updatedAt: Timestamp.now()
          };
          await updateDoc(docRef, updateData);
          observer.next();
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      });
    });
  }

  // Helper method to create query conditions
  createWhereCondition(field: string, operator: any, value: any) {
    return where(field, operator, value);
  }

  createOrderByCondition(field: string, direction: 'asc' | 'desc' = 'asc') {
    return orderBy(field, direction);
  }
}
