import {
  AirbyteLogger,
  AirbyteStreamBase,
  StreamKey,
  SyncMode,
} from 'faros-airbyte-cdk';
import {Dictionary} from 'ts-essentials';

import {Buildkite, BuildkiteConfig, Pipeline} from '../buildkite/buildkite';

interface PipelineState {
  lastUpdatedAt: string;
}

export class Pipelines extends AirbyteStreamBase {
  constructor(
    private readonly config: BuildkiteConfig,
    protected readonly logger: AirbyteLogger
  ) {
    super(logger);
  }

  getJsonSchema(): Dictionary<any, string> {
    return require('../../resources/schemas/pipelines.json');
  }
  get primaryKey(): StreamKey {
    return 'uuid';
  }
  async *readRecords(
    syncMode: SyncMode,
    cursorField?: string[],
    streamSlice?: Dictionary<any>,
    streamState?: Dictionary<any>
  ): AsyncGenerator<Pipeline> {
    const lastUpdatedAt =
      syncMode === SyncMode.INCREMENTAL
        ? streamState?.lastUpdatedAt
        : undefined;
    const buildkite = Buildkite.instance(this.config, this.logger);
    yield* buildkite.getPipelines(lastUpdatedAt);
  }

  getUpdatedState(
    currentStreamState: PipelineState,
    latestRecord: Pipeline
  ): PipelineState {
    const createdAt = new Date(latestRecord.createdAt);
    const lastUpdatedAt: Date = createdAt;

    return {
      lastUpdatedAt:
        lastUpdatedAt > new Date(currentStreamState?.lastUpdatedAt ?? 0)
          ? lastUpdatedAt?.toISOString()
          : currentStreamState?.lastUpdatedAt,
    };
  }
}
