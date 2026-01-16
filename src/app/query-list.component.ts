import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-query-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './query-list.component.html',
})
export class QueryListComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  responseData: any | null = null;
  private authService = inject(AuthService);

  // REMPLACEZ CECI PAR L'URL DE VOTRE WEBHOOK
  private webhookUrl = 'https://n8n.af10.fr:8443/test/0b011e50-c3ca-4425-ae73-85fa9b00c626';
  private localStorageKey = 'queries';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.sendQueriesFromLocalStorage();
  }

  private sendQueriesFromLocalStorage(): void {
    this.isLoading = true;
    this.error = null;
    this.responseData = null;

    try {
      let queries = localStorage.getItem("queries") || "";
      if(queries.startsWith(","))queries=queries.substring(1)
      const user_id = this.authService.user()?.uid;

      this.http.post(this.webhookUrl,{queries:queries, user_id: user_id}).subscribe({
        next: (response) => {
          this.responseData = response;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = `Erreur lors de l'envoi des données : ${err.message}`;
          this.isLoading = false;
        },
      });
    } catch (e) {
      this.error = 'Erreur lors de la lecture ou du parsing des données du localStorage.';
      this.isLoading = false;
    }
  }
}
