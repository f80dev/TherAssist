import { Component, OnInit, inject, signal, runInInjectionContext, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { TitleService } from './title.service';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/** Flat node with expandable and level information */
interface JsonTreeNode {
  key: string;
  value?: any;
  type?: string;
  children?: JsonTreeNode[];
}

@Component({
  selector: 'app-query-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './query-list.component.html',
  styleUrls: ['./query-list.component.css']
})
export class QueryListComponent implements OnInit {
  isLoading = signal(false);
  error = signal<string | null>(null);
  private authService = inject(AuthService);
  private titleService = inject(TitleService);
  private injector = inject(Injector);

  treeControl = new NestedTreeControl<JsonTreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<JsonTreeNode>();

  private webhookUrl = 'https://n8n.af10.fr:8443/prod/0b011e50-c3ca-4425-ae73-85fa9b00c626';

  constructor(private http: HttpClient) {}

  hasChild = (_: number, node: JsonTreeNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
    this.titleService.pageTitle.set('Liste des Queries');
    this.sendQueriesFromLocalStorage();
  }

  private sendQueriesFromLocalStorage(): void {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let queries = localStorage.getItem("queries") || "";
      if(queries.startsWith(","))queries=queries.substring(1)
      const user_id = this.authService.user()?.uid;

      this.http.post<any[]>(this.webhookUrl,{queries:queries, user_id: user_id}).subscribe({
        next: (response) => {
          runInInjectionContext(this.injector, () => {
            this.dataSource.data = this.transformResponseToTree(response);
            this.isLoading.set(false);
          });
        },
        error: (err) => {
          runInInjectionContext(this.injector, () => {
            this.error.set(`Erreur lors de l'envoi des données : ${err.message}`);
            this.isLoading.set(false);
          });
        },
      });
    } catch (e: any) {
      runInInjectionContext(this.injector, () => {
        this.error.set('Erreur lors de la lecture ou du parsing des données du localStorage: ' + e.message);
        this.isLoading.set(false);
      });
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      const day = this.pad(date.getDate());
      const month = this.pad(date.getMonth() + 1); // Les mois sont indexés à partir de 0
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error('Erreur de formatage de la date:', e);
      return dateString; // Retourne la date originale en cas d'erreur
    }
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private transformResponseToTree(response: any[]): JsonTreeNode[] {
    return response.map(item => {
      // Create a copy to avoid modifying the original object
      const details = { ...item };

      // Define the new top-level node
      const topLevelNode: JsonTreeNode = {
        key: `${this.formatDate(item.Date)} - ${item.Client}`,
        children: []
      };

      try{
        delete details.Query_ID;
        delete details.Owner_ID;
        delete details.File;
        delete details.Profil;
        delete details.row_number;
        delete details.webhookUrl
        delete details.headers
        delete details.body
        delete details.params
        delete details.query
        delete details.executionMode
      } catch (e) {

      }

      for(const k in details) {
        if(details[k].length=="")delete details[k]
      }

      // Build the tree for the remaining details
      topLevelNode.children = this.buildTreeFromObject(details);

      return topLevelNode;
    });
  }

  private buildTreeFromObject(obj: any): JsonTreeNode[] {
    if (typeof obj !== 'object' || obj === null) {
      return [];
    }

    const nodes: JsonTreeNode[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const type = typeof value;
        const node: JsonTreeNode = { key, value, type };

        if (type === 'object' && value !== null) {
          node.children = this.buildTreeFromObject(value);
          // For expandable nodes, we don't show the value directly
          delete node.value;
        }
        nodes.push(node);
      }
    }
    return nodes;
  }
}
