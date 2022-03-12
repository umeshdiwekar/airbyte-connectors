export interface Plan {
  readonly id: string;
  readonly type: string;
  readonly searchEntity: {
    readonly id: string;
    readonly key: string;
    readonly projectName: string;
    readonly planName: string;
  };
}

export interface Build {
  readonly id: number;
  readonly key: string;
  readonly buildNumber: number;
  readonly buildResultKey: string;
  readonly buildStartedTime: string;
  readonly buildCompletedTime?: string;
  readonly state: string;
  readonly link: {
    readonly href: string;
  };
  readonly plan: {
    readonly shortName: string;
    readonly key: string;
    readonly name: string;
    readonly link: {
      readonly href: string;
    };
  };
  readonly vcsRevisionKey: string;
  readonly vcsRevisions: {
    readonly vcsRevision: ReadonlyArray<VcsRevision>;
  };
}

export interface VcsRevision {
  readonly repositoryId: number;
  readonly repositoryName: string;
  readonly vcsRevisionKey: string;
}

export interface DeploymentProject {
  readonly id: number;
  readonly planKey: {
    readonly key: string;
  };
  readonly description: string;
  readonly environments: ReadonlyArray<Environment>;
}

export interface Environment {
  readonly id: number;
  readonly name: string;
}

export interface DeploymentVersion {
  readonly id: number;
  readonly items: ReadonlyArray<Artifact>;
}

export interface Artifact {
  readonly id: number;
  readonly name: string;
  readonly planResultKey: {
    readonly key: string;
    readonly resultNumber: number;
    readonly entityKey: {
      readonly key: string;
    };
  };
}

export interface Deployment {
  readonly deploymentVersion: DeploymentVersion;
  readonly deploymentVersionName: string;
  readonly id: number;
  readonly deploymentState: string;
  readonly startedDate: number;
  readonly finishedDate: number;
  environmentName: string;
}

export enum BuildStatusCategory {
  Canceled = 'Canceled',
  Failed = 'Failed',
  Queued = 'Queued',
  Running = 'Running',
  Success = 'Success',
  Unknown = 'Unknown',
  Custom = 'Custom',
}

export enum DeploymentStatusCategory {
  Canceled = 'Canceled',
  Custom = 'Custom',
  Failed = 'Failed',
  Queued = 'Queued',
  Running = 'Running',
  RolledBack = 'RolledBack',
  Success = 'Success',
}

export enum EnvironmentCategory {
  Prod = 'Prod',
  Staging = 'Staging',
  QA = 'QA',
  Dev = 'Dev',
  Sandbox = 'Sandbox',
  Custom = 'Custom',
}

export interface BuildStatus {
  category: BuildStatusCategory;
  detail: string;
}

export interface DeploymentStatus {
  category: DeploymentStatusCategory;
  detail: string;
}

export interface Environment {
  category: EnvironmentCategory;
  detail: string;
}

export interface OrganizationKey {
  uid: string;
  source: string;
}

export interface PipelineKey {
  uid: string;
  organization: OrganizationKey;
}

export interface BuildKey {
  uid: string;
  pipeline: PipelineKey;
}