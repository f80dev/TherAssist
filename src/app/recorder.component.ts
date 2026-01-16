import { Component, OnDestroy, signal, inject } from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-recorder',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgIf, MatButton, FormsModule],
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.css']
})
export class RecorderComponent implements OnDestroy {
  isRecording = false;
  message=""
  audioURL: SafeUrl | null = null;
  elapsedTime = signal('00:00:00');
  recordingName = signal('enregistrement');
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private timerInterval: any;
  private authService = inject(AuthService);

  // REMPLACEZ CECI PAR L'URL DE VOTRE WEBHOOK N8N
  private n8nWebhookUrl = 'https://n8n.af10.fr:8443/prod/129f4bfe-e6ac-4f47-8bad-0e539a53471f';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}


  protected async startRecording(): Promise<void> {
    try {
      this.isRecording = true;
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioURL = null;
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
        if(!this.isRecording){
          let audio = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.sendAudio(audio)
        }
      };

      this.mediaRecorder.start();
      this.startTimer();
    } catch (err) {
      console.error('Erreur lors de l\'accès au microphone :', err);
      this.isRecording = false;
    }
  }


  public stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;
      this.mediaRecorder.stop();
      this.stopTimer();
    }
  }

  async sendAudio(audio:Blob): Promise<void> {
    console.log('Envoi du fichier audio au webhook...');
    const query_id = await this.calculateHash(audio);
    const user_id = this.authService.user()?.uid;
    const audio_base64 = await this.blobToBase64(audio);

    const data = {
      query_id: query_id,
      name: this.recordingName(),
      user_id: user_id,
      audio_data: audio_base64
    };

    localStorage.setItem('queries',(localStorage.getItem("queries") || "") +","+query_id)

    this.http.post(this.n8nWebhookUrl, data).subscribe({
      next: (response) => {
        console.log('Webhook exécuté avec succès !', response);
        this.message='Enregistrement envoyé avec succès !';
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi au webhook :', error);
        this.message='Échec de l\'envoi de l\'enregistrement.';
      },
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async calculateHash(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private startTimer(): void {
    let startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const hours = Math.floor(elapsedTime / 3600000);
      const minutes = Math.floor((elapsedTime % 3600000) / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);
      this.elapsedTime.set(`${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`);
    }, 1000);
  }

  private stopTimer(): void {
    clearInterval(this.timerInterval);
    this.elapsedTime.set('00:00:00');
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private stopMediaStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
    this.stopMediaStream();
  }
}
