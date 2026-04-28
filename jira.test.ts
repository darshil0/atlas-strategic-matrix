import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraService } from '../../services/integrations/jira';
import { PersistenceService } from '../../services/core/persistence';
import { TaskStatus, Priority } from '@types';

vi.mock('@config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@config')>();
  return {
    ...actual,
    ENV: { ...actual.ENV, APP_VERSION: '3.6.1' },
    SYSTEM_CONSTANTS: {
      ...actual.SYSTEM_CONSTANTS,
      DEFAULT_RETRY_COUNT: 3,
      INITIAL_BACKOFF_MS: 1, // Faster tests
    },
  };
});

vi.mock('../../services/core/persistence', () => ({
  PersistenceService: {
    getJiraApiKey: vi.fn(),
    getJiraDomain: vi.fn(),
    getJiraProjectKey: vi.fn(),
    getJiraEmail: vi.fn(),
    getJiraConfig: vi.fn(),
    getGithubApiKey: vi.fn(),
    getGithubOwner: vi.fn(),
    getGithubRepo: vi.fn(),
    getGithubConfig: vi.fn(),
  },
}));

describe('JiraService', () => {
  let jiraService: JiraService;

  beforeEach(() => {
    jiraService = new JiraService();
    vi.clearAllMocks();
    
    // Default mock behavior
    vi.mocked(PersistenceService.getJiraApiKey).mockReturnValue('test-token');
    vi.mocked(PersistenceService.getJiraDomain).mockReturnValue('test-domain');
    vi.mocked(PersistenceService.getJiraProjectKey).mockReturnValue('ATLAS');
    vi.mocked(PersistenceService.getJiraEmail).mockReturnValue('test@example.com');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: '10001',
        key: 'ATLAS-1',
      }),
    });
  });

  it('should create a ticket successfully', async () => {
    const task = {
      id: 'AI-26-Q1-001',
      description: 'Test Ticket Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      category: '2026 Q1',
    };

    const result = await jiraService.createTicket(task);

    expect(result.success).toBe(true);
    expect(result.issueKey).toBe('ATLAS-1');
  });

  it('should handle 503 Service Unavailable with retry', async () => {
    const task = {
      id: 'AI-26-Q1-001',
      description: 'Test Ticket Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      category: '2026 Q1',
    };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ errorMessages: ['Server busy'] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '10001', key: 'ATLAS-1' }),
      });

    const result = await jiraService.createTicket(task);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle 429 Too Many Requests with backoff', async () => {
    const task = {
        id: 'AI-26-Q1-001',
        description: 'Test Ticket Description',
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        category: '2026 Q1',
      };
  
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: async () => ({ errorMessages: ['Rate limit exceeded'] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ id: '10001', key: 'ATLAS-1' }),
        });
  
      const result = await jiraService.createTicket(task);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should fail after maximum retries on persistent 5xx errors', async () => {
    const task = {
      id: 'AI-26-Q1-001',
      description: 'Test Ticket Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      category: '2026 Q1',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ errorMessages: ['Persistent failure'] }),
    });

    const result = await jiraService.createTicket(task);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Jira API [500]');
    // 1 original call + 3 retries = 4 calls total
    expect(global.fetch).toHaveBeenCalledTimes(4);
  }, 10000);
});
