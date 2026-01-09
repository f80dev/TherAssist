import { Component, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-query-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, JsonPipe],
  templateUrl: './query-list.component.html',
})
export class QueryListComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  responseData: any | null = null;

  // REMPLACEZ CECI PAR L'URL DE VOTRE WEBHOOK
  private webhookUrl = 'https://n8n.af10.fr:8443/prod/0b011e50-c3ca-4425-ae73-85fa9b00c626';
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

      this.http.post(this.webhookUrl,{queries:queries}).subscribe({
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
