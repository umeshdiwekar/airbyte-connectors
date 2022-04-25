export interface ProjectResponse {
  value: Project[];
}

export interface Project {
  readonly id: number;
  readonly SpaceId: string;
  readonly VariableSetId: string;
  readonly DeploymentProcessId: string;
  readonly ClonedFromProjectId: string;
  readonly DiscreteChannelRelease: boolean;
  readonly IncludedLibraryVariableSetIds: object;
  readonly DefaultToSkipIfAlreadyInstalled: boolean;
  readonly TenantedDeploymentMode: string;
  readonly DefaultGuidedFailureMode: string;
  readonly VersioningStrategy: object;
  readonly DonorPackage: string;
  readonly DonorPackageStepId: string;
  readonly ReleaseCreationStrategy: object;
  readonly ReleaseCreationPackage: string;
  readonly ReleaseCreationPackageStepId: string;
  readonly Name: string;
  readonly Slug: string;
  readonly Description: string;
  readonly IsDisabled: boolean;
  readonly ProjectGroupId: string;
  readonly LifecycleId: string;
  readonly AutoCreateRelease: boolean;
  readonly IsVersionControlled: boolean;
  readonly PersistenceSettings: object;
  readonly ProjectConnectivityPolicy: object;
  readonly Link: object;
}

export interface Channels {
  readonly id: number;
  readonly Name: string;
  readonly Description: string;
  readonly ProjectId: string;
  readonly LifecycleId: string;
  readonly Rules: boolean;
  readonly TenantTags: object;
  readonly SpaceId: object;
  readonly Link: object;
}

export interface Releases {
  readonly Id: number;
  readonly ProjectId: string;
  readonly SpaceId: string;
  readonly ChannelId: string;
  readonly Version: string;
  readonly ReleaseNotes: string;
  readonly ProjectDeploymentProcessSnapshotId: boolean;
  readonly IgnoreChannelRules: boolean;
  readonly BuildInformation: object;
  readonly Assembled: boolean;
  readonly LibraryVariableSetSnapshotIds: object;
  readonly SelectedPackages: object;
  readonly ProjectVariableSetSnapshotId: object;
  readonly VersionControlReference: object;
  readonly LastModifiedBy: object;
  readonly LastModifiedOn: object;
  readonly Link: object;
}

export interface Deployments {
  readonly Changes: object;
  readonly ChangesMarkdown: string;
  readonly ChannelId: string;
  readonly Comments: string;
  readonly Created: string;
  readonly DeployedBy: string;
  readonly DeployedById: string;
  readonly DeployedToMachineIds: object;
  readonly DeploymentProcessId: string;
  readonly EnvironmentId: string;
  readonly ExcludedMachineIds: object;
  readonly FailureEncountered: boolean;
  readonly ForcePackageDownload: boolean;
  readonly ForcePackageRedeployment: boolean;
  readonly FormValues: object;
  readonly Id: string;
  readonly LastModifiedBy: string;
  readonly LastModifiedOn: string;
  readonly Links: object;
  readonly ManifestVariableSetId: string;
  readonly Name: string;
  readonly ProjectId: string;
  readonly QueueTime: string;
  readonly QueueTimeExpiry: string;
  readonly ReleaseId: string;
  readonly SkipActions: object;
  readonly SpaceId: string;
  readonly SpecificMachineIds: object;
  readonly TaskId: string;
  readonly TenantId: string;
  readonly TentacleRetentionPeriod: object;
  readonly UseGuidedFailure: boolean;
}