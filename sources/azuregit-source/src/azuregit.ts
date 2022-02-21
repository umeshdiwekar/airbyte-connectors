import axios, {AxiosInstance} from 'axios';
import {AirbyteLogger} from 'faros-airbyte-cdk/lib';
import {wrapApiError} from 'faros-feeds-sdk';
import {VError} from 'verror';

import {
  CommitChangeCountsResponse,
  PullRequestCommit,
  PullRequestThreadResponse,
  TagCommit,
  User,
  UserResponse,
} from './models';
import {
  Branch,
  BranchResponse,
  CommitResponse,
  PullRequest,
  PullRequestCommitResponse,
  PullRequestResponse,
  Repository,
  RepositoryResponse,
  Tag,
  TagResponse,
} from './models';

const DEFAULT_API_VERSION = '6.0';
const DEFAULT_GRAPH_VERSION = '4.1-preview.1';

export interface AzureGitConfig {
  readonly access_token: string;
  readonly organization: string;
  readonly project: string;
  readonly api_version?: string;
  readonly graph_version?: string;
}

export class AzureGit {
  private static azureGit: AzureGit = null;

  constructor(
    private readonly httpClient: AxiosInstance,
    private readonly graphClient: AxiosInstance,
    private readonly logger: AirbyteLogger
  ) {}

  static async instance(
    config: AzureGitConfig,
    logger: AirbyteLogger
  ): Promise<AzureGit> {
    if (AzureGit.azureGit) return AzureGit.azureGit;

    if (!config.access_token) {
      throw new VError('access_token must be a not empty string');
    }

    if (!config.organization) {
      throw new VError('organization must be a not empty string');
    }

    if (!config.project) {
      throw new VError('project must be a not empty string');
    }

    const version = config.api_version ?? DEFAULT_API_VERSION;
    const httpClient = axios.create({
      baseURL: `https://dev.azure.com/${config.organization}/${config.project}/_apis`,
      timeout: 10000, // default is `0` (no timeout)
      maxContentLength: Infinity, //default is 2000 bytes
      params: {
        'api-version': version,
      },
      headers: {
        Authorization: `Basic ${config.access_token}`,
      },
    });
    const graphVersion = config.graph_version ?? DEFAULT_GRAPH_VERSION;
    const graphClient = axios.create({
      baseURL: `https://vssps.dev.azure.com/${config.organization}/_apis/graph`,
      timeout: 10000, // default is `0` (no timeout)
      maxContentLength: Infinity, //default is 2000 bytes
      params: {
        'api-version': graphVersion,
      },
      headers: {
        Authorization: `Basic ${config.access_token}`,
      },
    });

    AzureGit.azureGit = new AzureGit(httpClient, graphClient, logger);
    return AzureGit.azureGit;
  }

  async checkConnection(): Promise<void> {
    try {
      const iter = this.getRepositories();
      await iter.next();
    } catch (err: any) {
      let errorMessage = 'Please verify your access token is correct. Error: ';
      if (err.error_code || err.error_info) {
        errorMessage += `${err.error_code}: ${err.error_info}`;
        throw new VError(errorMessage);
      }
      try {
        errorMessage += err.message ?? err.statusText ?? wrapApiError(err);
      } catch (wrapError: any) {
        errorMessage += wrapError.message;
      }
      throw new VError(errorMessage);
    }
  }

  async *getRepositories(): AsyncGenerator<Repository> {
    const res = await this.httpClient.get<RepositoryResponse>(
      'git/repositories'
    );
    for (const item of res.data.value) {
      const branchResponse = await this.httpClient.get<BranchResponse>(
        `git/repositories/${item.id}/stats/branches`
      );
      if (branchResponse.status === 200) {
        const branches: Branch[] = [];
        for (const branch of branchResponse.data.value) {
          const branchItem: Branch = branch;
          const commitResponse = await this.httpClient.get<CommitResponse>(
            `git/repositories/${item.id}/commits?searchCriteria.itemVersion.version=${branch.name}`
          );
          if (commitResponse.status === 200) {
            branchItem.commits = commitResponse.data.value;
          }
          branches.push(branchItem);
        }
        item.branches = branches;
      }
      const tagsResponse = await this.httpClient.get<TagResponse>(
        `git/repositories/${item.id}/refs?filter=tags`
      );
      if (tagsResponse.status === 200) {
        const tags: Tag[] = [];
        for (const tag of tagsResponse.data.value) {
          const tagItem: Tag = tag;
          const commitResponse = await this.httpClient.get<TagCommit>(
            `git/repositories/${item.id}/annotatedtags/${tag.objectId}`
          );
          if (commitResponse.status === 200) {
            tagItem.commit = commitResponse.data;
          }
          tags.push(tagItem);
        }
        item.tags = tags;
      }
      yield item;
    }
  }

  async *getPullRequests(): AsyncGenerator<PullRequest> {
    const res = await this.httpClient.get<PullRequestResponse>(
      'git/pullrequests?searchCriteria.status=all'
    );
    for (const item of res.data.value) {
      const commitResponse =
        await this.httpClient.get<PullRequestCommitResponse>(
          `git/repositories/${item.repository.id}/pullRequests/${item.pullRequestId}/commits`
        );
      if (commitResponse.status === 200) {
        const commits: PullRequestCommit[] = [];

        for (const commit of commitResponse.data.value) {
          const commitChangeCountsResponse =
            await this.httpClient.get<CommitChangeCountsResponse>(
              `git/repositories/${item.repository.id}/commits/${commit.commitId}/changes`
            );
          if (commitChangeCountsResponse.status === 200) {
            commit.changeCounts = commitChangeCountsResponse.data.changeCounts;
          }
          commits.push(commit);
        }
        item.commits = commits;
      }
      const threadResponse =
        await this.httpClient.get<PullRequestThreadResponse>(
          `git/repositories/${item.repository.id}/pullRequests/${item.pullRequestId}/threads`
        );
      if (threadResponse.status === 200) {
        item.threads = threadResponse.data.value;
      }
      yield item;
    }
  }

  async *getUsers(): AsyncGenerator<User> {
    const res = await this.graphClient.get<UserResponse>('users');
    for (const item of res.data.value) {
      yield item;
    }
  }
}
