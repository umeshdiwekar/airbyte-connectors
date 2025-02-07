import {AirbyteRecord} from 'faros-airbyte-cdk';
import {Utils} from 'faros-feeds-sdk';

import {DestinationModel, DestinationRecord, StreamContext} from '../converter';
import {OctopusConverter} from './common';
import {Deployment} from './models';

export class Deployments extends OctopusConverter {
  readonly destinationModels: ReadonlyArray<DestinationModel> = [
    'cicd_Deployment',
  ];

  async convert(
    record: AirbyteRecord,
    ctx: StreamContext
  ): Promise<ReadonlyArray<DestinationRecord>> {
    const source = this.streamName.source;
    const deployment = record.record.data as Deployment;
    const uid = deployment.Id;
    const res: DestinationRecord[] = [];

    res.push({
      model: 'cicd_Deployment',
      record: {
        uid,
        channelId: deployment.ChannelId,
        changes: deployment.Changes,
        changesMarkdown: deployment.ChangesMarkdown,
        comments: deployment.Comments,
        deployedBy: deployment.DeployedBy,
        deployedById: deployment.DeployedBy,
        created: deployment.Created,
        lastModifiedOn: deployment.LastModifiedOn,
        deployedToMachineIds: deployment.DeployedToMachineIds,
        deploymentProcessId: deployment.DeploymentProcessId,
        environmentId: deployment.EnvironmentId,
        excludedMachineIds: deployment.ExcludedMachineIds,
        forcePackageRedeployment: deployment.ForcePackageRedeployment,
        failureEncountered: deployment.FailureEncountered,
        formValues: deployment.FormValues,
        source,
      },
    });
    return res;
  }
}
