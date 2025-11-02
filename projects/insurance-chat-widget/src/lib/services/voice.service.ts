import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { WidgetConfigService } from './widget-config.service';
import { AnalyticsService } from './analytics.service';

export interface VoiceCaptureState {
  isCapturing: boolean;
  isProcessing: boolean;
  error: string | null;
  audioLevel: number; // 0-100
}

@Injectable({
  providedIn: 'root',
})
export class VoiceService {
  private configService = inject(WidgetConfigService);
  private analyticsService = inject(AnalyticsService);

  // Audio context and stream
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;

  // State management
  private captureState = signal<VoiceCaptureState>({
    isCapturing: false,
    isProcessing: false,
    error: null,
    audioLevel: 0,
  });

  // Subjects for events
  private captureStartSubject = new Subject<void>();
  private captureStopSubject = new Subject<void>();
  private audioLevelSubject = new Subject<number>();
  private destroySubject = new Subject<void>();

  // Public signals
  state = this.captureState.asReadonly();

  // Public observables
  captureStart$ = this.captureStartSubject.asObservable();
  captureStop$ = this.captureStopSubject.asObservable();
  audioLevel$ = this.audioLevelSubject.asObservable();

  /**
   * Check microphone permission and availability
   */
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());
      
      this.captureState.update((state) => ({
        ...state,
        error: null,
      }));
      
      return true;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      this.captureState.update((state) => ({
        ...state,
        error: errorMessage,
      }));
      return false;
    }
  }

  /**
   * Start voice capture
   */
  async startCapture(): Promise<boolean> {
    if (this.captureState().isCapturing) {
      return true;
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });

      // Create analyser for VU meter
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Create microphone source
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      // Create data array for analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Update state
      this.captureState.update((state) => ({
        ...state,
        isCapturing: true,
        isProcessing: false,
        error: null,
      }));

      // Start audio level monitoring
      this.startAudioLevelMonitoring();

      // Emit events
      this.captureStartSubject.next();

      // Analytics
      const config = this.configService.getConfig();
      if (config) {
        this.analyticsService.emit({
          event: 'action.mic_start',
          sessionId: '',
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      this.captureState.update((state) => ({
        ...state,
        isCapturing: false,
        error: errorMessage,
      }));
      return false;
    }
  }

  /**
   * Stop voice capture
   */
  stopCapture(): void {
    if (!this.captureState().isCapturing) {
      return;
    }

    // Stop audio level monitoring
    this.stopAudioLevelMonitoring();

    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore errors when closing
      });
      this.audioContext = null;
    }

    // Clean up
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;

    // Update state
    this.captureState.update((state) => ({
      ...state,
      isCapturing: false,
      isProcessing: false,
      audioLevel: 0,
    }));

    // Emit event
    this.captureStopSubject.next();

    // Analytics
    const config = this.configService.getConfig();
    if (config) {
      this.analyticsService.emit({
        event: 'action.mic_stop',
        sessionId: '',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current audio level (0-100)
   */
  getAudioLevel(): number {
    return this.captureState().audioLevel;
  }

  /**
   * Get media stream for WebSocket streaming
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  /**
   * Start monitoring audio levels
   */
  private startAudioLevelMonitoring(): void {
    if (!this.analyser || !this.dataArray) {
      return;
    }

    const updateLevel = () => {
      if (!this.analyser || !this.dataArray || !this.captureState().isCapturing) {
        return;
      }

      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate average level
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      
      // Normalize to 0-100
      const level = Math.min(100, (average / 255) * 100);

      this.captureState.update((state) => ({
        ...state,
        audioLevel: level,
      }));

      this.audioLevelSubject.next(level);

      if (this.captureState().isCapturing) {
        requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  }

  /**
   * Stop monitoring audio levels
   */
  private stopAudioLevelMonitoring(): void {
    this.captureState.update((state) => ({
      ...state,
      audioLevel: 0,
    }));
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Microphone access denied. Please enable microphone permissions in your browser settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No microphone found. Please connect a microphone and try again.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'Microphone is being used by another application. Please close other applications and try again.';
    } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      return 'Microphone does not meet the required specifications.';
    } else {
      return `Microphone error: ${error.message || 'Unknown error'}`;
    }
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.stopCapture();
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}

