import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { Education } from '../../../domain/entities/experience.entity';
import { GetEducationsUseCase, DeleteEducationUseCase } from '../../../domain/use-cases/education.use-case';

@Component({
  selector: 'app-admin-education',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './education.html',
  styleUrl: './education.scss'
})
export class AdminEducation implements OnInit {
  educations: Education[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private getEducationsUseCase: GetEducationsUseCase,
    private deleteEducationUseCase: DeleteEducationUseCase,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadEducations();
  }

  private loadEducations() {
    this.isLoading = true;
    this.getEducationsUseCase.execute().subscribe({
      next: (educations) => {
        this.educations = educations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading educations:', error);
        this.snackBar.open('Error loading educations', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  createEducation() {
    this.router.navigate(['/admin/education/new']);
  }

  editEducation(education: Education) {
    this.router.navigate(['/admin/education/edit', education.id]);
  }

  deleteEducation(education: Education) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Education',
        message: `Are you sure you want to delete "${education.degree} at ${education.institution}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEducationUseCase.execute(education.id).subscribe({
          next: () => {
            this.snackBar.open('Education deleted successfully', 'Close', { duration: 3000 });
            this.loadEducations();
          },
          error: (error) => {
            console.error('Error deleting education:', error);
            this.snackBar.open('Error deleting education', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getEducationDuration(education: Education): string {
    const start = new Date(education.startDate);
    const end = education.endDate ? new Date(education.endDate) : new Date();
    
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    if (startYear === endYear) {
      return startYear.toString();
    }
    
    return `${startYear} - ${endYear}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  getTotalEducations(): number {
    return this.educations.length;
  }

  getCompletedEducations(): number {
    return this.educations.filter(edu => edu.endDate).length;
  }

  getHighestDegree(): string {
    if (this.educations.length === 0) return 'N/A';
    
    const degreeRanking = ['Bachelor', 'Master', 'PhD', 'Doctorate'];
    let highest = '';
    let highestRank = -1;
    
    this.educations.forEach(edu => {
      const rank = degreeRanking.findIndex(degree => 
        edu.degree.toLowerCase().includes(degree.toLowerCase())
      );
      if (rank > highestRank) {
        highestRank = rank;
        highest = edu.degree;
      }
    });
    
    return highest || this.educations[0].degree;
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
