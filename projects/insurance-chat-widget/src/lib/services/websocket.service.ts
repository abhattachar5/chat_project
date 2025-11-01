import { Injectable, inject } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { WidgetConfigService } from './widget-config.service';
import { AnalyticsService } from './analytics.service';

export interface ASRMessage {
  type: 'partial' | 'final' | 'error';
  text?: string;
  confidence?: number;
  utteranceId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface TTSMessage {
  type: 'audio' | 'marker' | 'done' | 'error';
  audio?: ArrayBuffer;
  marker?: string;
  error?: {
    code: string;
    message: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private configService = inject(WidgetConfigService);
  private analyticsService = inject(AnalyticsService);

  private asrSocket: WebSocket | null = null;
  private ttsSocket: WebSocket | null = null;

  // Subjects for ASR
  private asrMessagesSubject = new Subject<ASRMessage>();
  private asrConnectionSubject = new Subject<boolean>();

  // Subjects for TTS
  private ttsMessagesSubject = new Subject<TTSMessage>();
  private ttsConnectionSubject = new Subject<boolean>();

  // Public observables
  asrMessages$ = this.asrMessagesSubject.asObservable();
  asrConnected$ = this.asrConnectionSubject.asObservable();
  ttsMessages$ = this.ttsMessagesSubject.asObservable();
  ttsConnected$ = this.ttsConnectionSubject.asObservable();

  /**
   * Get base WebSocket URL
   */
  private getWebSocketBaseUrl(): string {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized');
    }

    const baseUrls: Record<string, string> = {
      prod: 'wss://api.provider.example',
      staging: 'wss://api-staging.provider.example',
      dev: 'wss://api-dev.provider.example',
    };

    const base = baseUrls[config.environment] || baseUrls.dev;
    return base.replace(/^https?/, 'wss');
  }

  /**
   * Connect to ASR WebSocket
   */
  connectASR(sessionId: string, lang: string = 'en-GB', sampleRate: number = 48000): Observable<ASRMessage> {
    if (this.asrSocket?.readyState === WebSocket.OPEN) {
      return this.asrMessages$;
    }

    return new Observable((observer) => {
      try {
        const wsUrl = `${this.getWebSocketBaseUrl()}/ws/asr?sessionId=${sessionId}&lang=${lang}&sampleRate=${sampleRate}`;
        this.asrSocket = new WebSocket(wsUrl);

        this.asrSocket.onopen = () => {
          this.asrConnectionSubject.next(true);
          
          // Send start message
          this.asrSocket?.send(JSON.stringify({
            type: 'start',
            lang,
            sampleRate,
          }));
        };

        this.asrSocket.onmessage = (event) => {
          try {
            const message: ASRMessage = JSON.parse(event.data);
            this.asrMessagesSubject.next(message);
            observer.next(message);
          } catch (error) {
            console.error('Error parsing ASR message:', error);
          }
        };

        this.asrSocket.onerror = (error) => {
          const errorMessage: ASRMessage = {
            type: 'error',
            error: {
              code: 'websocket_error',
              message: 'WebSocket connection error',
            },
          };
          this.asrMessagesSubject.next(errorMessage);
          observer.error(errorMessage);
        };

        this.asrSocket.onclose = () => {
          this.asrConnectionSubject.next(false);
        };
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Send audio data to ASR
   */
  sendAudioData(data: ArrayBuffer | Blob): void {
    if (this.asrSocket?.readyState === WebSocket.OPEN) {
      this.asrSocket.send(data);
    }
  }

  /**
   * Send audio chunk to ASR (JSON format)
   */
  sendAudioChunk(base64Data: string): void {
    if (this.asrSocket?.readyState === WebSocket.OPEN) {
      this.asrSocket.send(JSON.stringify({
        type: 'audio',
        payload: base64Data,
      }));
    }
  }

  /**
   * Stop ASR capture
   */
  stopASR(): void {
    if (this.asrSocket?.readyState === WebSocket.OPEN) {
      this.asrSocket.send(JSON.stringify({ type: 'stop' }));
    }
  }

  /**
   * Cancel ASR capture
   */
  cancelASR(): void {
    if (this.asrSocket?.readyState === WebSocket.OPEN) {
      this.asrSocket.send(JSON.stringify({ type: 'cancel' }));
    }
    this.disconnectASR();
  }

  /**
   * Disconnect ASR WebSocket
   */
  disconnectASR(): void {
    if (this.asrSocket) {
      this.asrSocket.close();
      this.asrSocket = null;
      this.asrConnectionSubject.next(false);
    }
  }

  /**
   * Connect to TTS WebSocket
   */
  connectTTS(sessionId: string, voice: string = 'neutral-uk'): Observable<TTSMessage> {
    if (this.ttsSocket?.readyState === WebSocket.OPEN) {
      return this.ttsMessages$;
    }

    return new Observable((observer) => {
      try {
        const wsUrl = `${this.getWebSocketBaseUrl()}/ws/tts?sessionId=${sessionId}&voice=${voice}`;
        this.ttsSocket = new WebSocket(wsUrl);

        this.ttsSocket.onopen = () => {
          this.ttsConnectionSubject.next(true);
        };

        this.ttsSocket.onmessage = (event) => {
          try {
            // Handle binary audio data
            if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
              const message: TTSMessage = {
                type: 'audio',
                audio: event.data instanceof ArrayBuffer ? event.data : undefined,
              };
              this.ttsMessagesSubject.next(message);
              observer.next(message);
            } else {
              // Handle JSON messages
              const message: TTSMessage = JSON.parse(event.data);
              this.ttsMessagesSubject.next(message);
              observer.next(message);
            }
          } catch (error) {
            console.error('Error parsing TTS message:', error);
          }
        };

        this.ttsSocket.onerror = (error) => {
          const errorMessage: TTSMessage = {
            type: 'error',
            error: {
              code: 'websocket_error',
              message: 'TTS WebSocket connection error',
            },
          };
          this.ttsMessagesSubject.next(errorMessage);
          observer.error(errorMessage);
        };

        this.ttsSocket.onclose = () => {
          this.ttsConnectionSubject.next(false);
        };
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Request TTS audio
   */
  requestTTS(text: string, voice: string = 'neutral-uk'): void {
    if (this.ttsSocket?.readyState === WebSocket.OPEN) {
      this.ttsSocket.send(JSON.stringify({
        type: 'start',
        voice,
        text,
      }));
    }
  }

  /**
   * Stop TTS playback
   */
  stopTTS(): void {
    if (this.ttsSocket?.readyState === WebSocket.OPEN) {
      this.ttsSocket.send(JSON.stringify({ type: 'stop' }));
    }
  }

  /**
   * Disconnect TTS WebSocket
   */
  disconnectTTS(): void {
    if (this.ttsSocket) {
      this.ttsSocket.close();
      this.ttsSocket = null;
      this.ttsConnectionSubject.next(false);
    }
  }

  /**
   * Check if ASR is connected
   */
  isASRConnected(): boolean {
    return this.asrSocket?.readyState === WebSocket.OPEN;
  }

  /**
   * Check if TTS is connected
   */
  isTTSConnected(): boolean {
    return this.ttsSocket?.readyState === WebSocket.OPEN;
  }
}

