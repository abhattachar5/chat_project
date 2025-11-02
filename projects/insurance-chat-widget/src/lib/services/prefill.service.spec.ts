import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PrefillService } from './prefill.service';
import { AnswerService } from './answer.service';
import { IntakeService } from './intake.service';
import { SessionService } from './session.service';
import { AnalyticsService } from './analytics.service';
import { WidgetConfigService } from './widget-config.service';
import { PrefillAnswer, ConfirmationResponse } from '../models/intake.model';
import { QuestionEnvelope } from '../models/widget-config.model';
import { of, throwError } from 'rxjs';

describe('PrefillService', () => {
  let service: PrefillService;
  let answerService: AnswerService;
  let analyticsService: AnalyticsService;
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnswerService,
        IntakeService,
        SessionService,
        AnalyticsService,
        WidgetConfigService,
      ],
    });
    service = TestBed.inject(PrefillService);
    answerService = TestBed.inject(AnswerService);
    analyticsService = TestBed.inject(AnalyticsService);
    sessionService = TestBed.inject(SessionService);

    // Mock session service
    spyOn(sessionService, 'sessionId').and.returnValue('test-session');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('storePrefillAnswers', () => {
    it('should store prefill answers from confirmation response', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
            evidenceRefs: ['file1:1'],
          },
        ],
      };

      spyOn(analyticsService, 'emitEvent').and.callThrough();

      service.storePrefillAnswers(mockResponse);

      service.prefillAnswers.subscribe((answers) => {
        expect(answers.length).toBe(1);
        expect(answers[0].questionId).toBe('q1');
        expect(answers[0].answer).toBe('Asthma');
        expect(analyticsService.emitEvent).toHaveBeenCalled();
      });
    });
  });

  describe('hasPrefillAnswers', () => {
    it('should return false when no prefill answers', () => {
      expect(service.hasPrefillAnswers()).toBe(false);
    });

    it('should return true when prefill answers exist', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
        ],
      };

      service.storePrefillAnswers(mockResponse);
      expect(service.hasPrefillAnswers()).toBe(true);
    });
  });

  describe('getConfirmedConditionLabels', () => {
    it('should return empty array when no prefill answers', () => {
      const labels = service.getConfirmedConditionLabels();
      expect(labels).toEqual([]);
    });

    it('should return condition labels from prefill answers', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 2,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
          {
            questionId: 'q2',
            answer: ['Diabetes', 'Hypertension'],
            source: 'prefill',
          },
        ],
      };

      service.storePrefillAnswers(mockResponse);
      const labels = service.getConfirmedConditionLabels();
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('getPrefillAnswer', () => {
    it('should return prefill answer by questionId', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
        ],
      };

      service.storePrefillAnswers(mockResponse);
      const answer = service.getPrefillAnswer('q1');
      expect(answer).toBeTruthy();
      expect(answer?.questionId).toBe('q1');
    });

    it('should return undefined for non-existent questionId', () => {
      const answer = service.getPrefillAnswer('non-existent');
      expect(answer).toBeUndefined();
    });
  });

  describe('submitPrefillAnswers', () => {
    it('should submit prefill answers successfully', (done) => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
            evidenceRefs: ['file1:1'],
          },
        ],
      };

      const mockQuestionEnvelope: QuestionEnvelope = {
        sessionId: 'test-session',
        question: {
          id: 'q2',
          text: 'Any other conditions?',
          type: 'text',
        },
      };

      spyOn(analyticsService, 'intakePrefillSubmitted').and.callThrough();
      spyOn(answerService, 'submitAnswer').and.returnValue(of(mockQuestionEnvelope));

      service.storePrefillAnswers(mockResponse);

      service.submitPrefillAnswers('test-session').subscribe({
        next: (envelope) => {
          expect(envelope).toEqual(mockQuestionEnvelope);
          expect(analyticsService.intakePrefillSubmitted).toHaveBeenCalled();
          expect(answerService.submitAnswer).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle error when no prefill answers', (done) => {
      service.submitPrefillAnswers('test-session').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toContain('No prefill answers');
          done();
        },
      });
    });

    it('should handle submission errors', (done) => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
        ],
      };

      spyOn(answerService, 'submitAnswer').and.returnValue(
        throwError(() => new Error('Submission failed'))
      );

      service.storePrefillAnswers(mockResponse);

      service.submitPrefillAnswers('test-session').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });
    });
  });

  describe('removePrefillAnswer', () => {
    it('should remove prefill answer by questionId', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 2,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
          {
            questionId: 'q2',
            answer: 'Diabetes',
            source: 'prefill',
          },
        ],
      };

      service.storePrefillAnswers(mockResponse);
      service.removePrefillAnswer('q1');

      service.prefillAnswers.subscribe((answers) => {
        expect(answers.length).toBe(1);
        expect(answers[0].questionId).toBe('q2');
      });
    });
  });

  describe('clearPrefillAnswers', () => {
    it('should clear all prefill answers', () => {
      const mockResponse: ConfirmationResponse = {
        sessionId: 'test-session',
        confirmedCount: 1,
        rejectedCount: 0,
        prefill: [
          {
            questionId: 'q1',
            answer: 'Asthma',
            source: 'prefill',
          },
        ],
      };

      service.storePrefillAnswers(mockResponse);
      service.clearPrefillAnswers();

      expect(service.hasPrefillAnswers()).toBe(false);
      service.prefillAnswers.subscribe((answers) => {
        expect(answers.length).toBe(0);
      });
    });
  });
});

