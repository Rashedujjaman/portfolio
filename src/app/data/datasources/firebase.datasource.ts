import { Injectable } from '@angular/core';
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
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataSource {
  constructor(private firestore: Firestore) {}

  // Generic CRUD operations
  create<T>(collectionName: string, data: any): Observable<T> {
    const collectionRef = collection(this.firestore, collectionName);
    const timestamp = Timestamp.now();
    const docData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    return from(addDoc(collectionRef, docData)).pipe(
      map(docRef => ({ ...docData, id: docRef.id } as T))
    );
  }

  getById<T>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            ...data,
            id: snapshot.id,
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as T;
        }
        return null;
      })
    );
  }

  getAll<T>(collectionName: string, conditions?: any[]): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    let q = query(collectionRef);
    
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, condition);
      });
    }
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate()
          } as T;
        })
      )
    );
  }

  update<T>(collectionName: string, id: string, data: Partial<T>): Observable<T> {
    const docRef = doc(this.firestore, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => ({ ...data, id } as T))
    );
  }

  delete(collectionName: string, id: string): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(deleteDoc(docRef));
  }

  // Helper method to create query conditions
  createWhereCondition(field: string, operator: any, value: any) {
    return where(field, operator, value);
  }

  createOrderByCondition(field: string, direction: 'asc' | 'desc' = 'asc') {
    return orderBy(field, direction);
  }
}
