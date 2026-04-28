import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GithubService } from '../../services/integrations/github';
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
    getGithubApiKey: vi.fn(),
    getGithubOwner: vi.fn(),
    getGithubRepo: vi.fn(),
    getGithubConfig: vi.fn(),
    getJiraApiKey: vi.fn(),
    getJiraDomain: vi.fn(),
    getJiraEmail: vi.fn(),
    getJiraProjectKey: vi.fn(),
    getJiraConfig: vi.fn(),
  },
}));

describe('GithubService', () => {
  let githubService: GithubService;

  beforeEach(() => {
    githubService = new GithubService();
    vi.clearAllMocks();
    
    // Default mock behavior
    vi.mocked(PersistenceService.getGithubApiKey).mockReturnValue('test-token');
    vi.mocked(PersistenceService.getGithubOwner).mockReturnValue('test-owner');
    vi.mocked(PersistenceService.getGithubRepo).mockReturnValue('test-repo');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 1,
        number: 101,
        html_url: 'https://github.com/test-owner/test-repo/issues/101',
        title: 'Test Issue',
        state: 'open',
        labels: [],
      }),
    });
  });

  it('should create an issue successfully', async () => {
    const task = {
      id: 'AI-26-Q1-001',
      description: 'Test Issue Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      category: '2026 Q1',
    };

    const result = await githubService.createIssue(task);

    expect(result.issueNumber).toBe(101);
  });

  it('should handle 500 error with retry', async () => {
    const task = {
      id: 'AI-26-Q1-001',
      description: 'Test Issue Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      category: '2026 Q1',
    };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server crashed' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, number: 101, html_url: 'url' }),
      });

    const result = await githubService.createIssue(task);
    expect(result.issueNumber).toBe(101);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should verify syncPlan handles existing issues', async () => {
    const tasks = [{
      id: 'AI-26-Q1-001',
      description: 'Task 1',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      category: '2026 Q1',
      theme: 'AI',
      dependencies: [],
    }];

    const githubService = new GithubService();
    
    // Completely reset and mock fetch
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/milestones')) {
        return { ok: true, status: 200, json: async () => [] } as Response;
      }
      // findExistingIssue is called with `?labels=${taskId}`
      if (urlStr.includes('/issues?labels=')) {
        return { 
          ok: true, 
          status: 200, 
          json: async () => [{ id: 1, number: 101, title: '[AI-26-Q1-001] Test', state: 'open', labels: ['AI-26-Q1-001'] }] 
        } as Response;
      }
      return { ok: true, status: 200, json: async () => ({}) } as Response;
    }));

    const result = await githubService.syncPlan(tasks);
    expect(result.skipped).toBe(1);
  });
});
