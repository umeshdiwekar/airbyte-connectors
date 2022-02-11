import axios from 'axios';
import {
  AirbyteLogger,
  AirbyteLogLevel,
  AirbyteSpec,
  SyncMode,
} from 'faros-airbyte-cdk';
import fs from 'fs-extra';
import {VError} from 'verror';

import {AzurePipeline} from '../src/azurepipeline';
import * as sut from '../src/index';

const azureActivePipeline = AzurePipeline.instance;

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('index', () => {
  test('ok?', async () => {
    expect('OK').toEqual('OK');
  });
});

describe('index', () => {
  const logger = new AirbyteLogger(
    // Shush messages in tests, unless in debug
    process.env.LOG_LEVEL === 'debug'
      ? AirbyteLogLevel.DEBUG
      : AirbyteLogLevel.FATAL
  );

  beforeEach(() => {
    AzurePipeline.instance = azureActivePipeline;
  });

  function readTestResourceFile(fileName: string): any {
    return JSON.parse(fs.readFileSync(`test_files/${fileName}`, 'utf8'));
  }

  test('spec', async () => {
    const source = new sut.AzurePipelineSource(logger);
    await expect(source.spec()).resolves.toStrictEqual(
      new AirbyteSpec(readTestResourceFile('spec.json'))
    );
  });

  test('check connection - no access token', async () => {
    const source = new sut.AzurePipelineSource(logger);
    await expect(
      source.checkConnection({
        access_token: '',
        organization: 'organization',
        project: 'project',
      } as any)
    ).resolves.toStrictEqual([
      false,
      new VError('access_token must be a not empty string'),
    ]);
  });

  test('streams - pipelines, use full_refresh sync mode', async () => {
    const fnPipelinesFunc = jest.fn();

    AzurePipeline.instance = jest.fn().mockImplementation(() => {
      const pipelinesResource: any[] = readTestResourceFile('pipelines.json');
      return new AzurePipeline(
        {
          get: fnPipelinesFunc.mockResolvedValue({
            data: {value: pipelinesResource},
          }),
        } as any,
        null
      );
    });
    const source = new sut.AzurePipelineSource(logger);
    const streams = source.streams({} as any);

    const pipelinesStream = streams[0];
    const pipelineIter = pipelinesStream.readRecords(SyncMode.FULL_REFRESH);
    const pipelines = [];
    for await (const pipeline of pipelineIter) {
      pipelines.push(pipeline);
    }

    expect(fnPipelinesFunc).toHaveBeenCalledTimes(1);
    expect(pipelines).toStrictEqual(readTestResourceFile('pipelines.json'));
  });

  test('streams - builds, use full_refresh sync mode', async () => {
    const fnBuildsFunc = jest.fn();

    AzurePipeline.instance = jest.fn().mockImplementation(() => {
      const buildsResource: any[] = readTestResourceFile('builds.json');
      return new AzurePipeline(
        {
          get: fnBuildsFunc.mockResolvedValue({
            data: {value: buildsResource},
          }),
        } as any,
        null
      );
    });
    const source = new sut.AzurePipelineSource(logger);
    const streams = source.streams({} as any);

    const buildsStream = streams[0];
    const buildIter = buildsStream.readRecords(SyncMode.FULL_REFRESH);
    const builds = [];
    for await (const build of buildIter) {
      builds.push(build);
    }

    expect(fnBuildsFunc).toHaveBeenCalledTimes(1);
    expect(builds).toStrictEqual(readTestResourceFile('builds.json'));
  });
});