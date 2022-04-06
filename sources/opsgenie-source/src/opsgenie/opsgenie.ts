import axios, {AxiosInstance} from 'axios';
import {AirbyteLogger, wrapApiError} from 'faros-airbyte-cdk';
import {VError} from 'verror';

import {
    Incident,
    IncidentTimeLinePaginateResponse,
    PaginateResponse,
    Service,
    Team,
    User,
} from './models';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_BASE_URL = 'https://api.opsgenie.com/';

export interface OpsGenieConfig {
    readonly api_key: string;
    readonly page_size?: number;
}

export class OpsGenie {
    private static opsGenie: OpsGenie = null;

    constructor(
        private readonly restClient: AxiosInstance,
        private readonly pageSize?: number
    ) {}

    static instance(config: OpsGenieConfig, logger: AirbyteLogger): OpsGenie {
        if (OpsGenie.opsGenie) return OpsGenie.opsGenie;

        if (!config.api_key) {
            throw new VError('API Key has to be provided');
        }
        const auth = `GenieKey ${config.api_key}`;

        const httpClient = axios.create({
            baseURL: `${DEFAULT_BASE_URL}`,
            timeout: 5000,
            headers: {Authorization: auth},
        });

        const pageSize = config.page_size ?? DEFAULT_PAGE_SIZE;

        OpsGenie.opsGenie = new OpsGenie(httpClient, pageSize);
        logger.debug('Created OpsGenie instance');
        return OpsGenie.opsGenie;
    }

    async checkConnection(): Promise<void> {
        try {
            await this.restClient.get('v2/users');
        } catch (err: any) {
            let errorMessage = 'Please verify your api key is correct. Error: ';
            if (err.error_code || err.error_info) {
                errorMessage += `${err.error_code}: ${err.error_info}`;
                throw new VError(errorMessage);
            }
            try {
                errorMessage +=
                    err.message ?? err.statusText ?? wrapApiError(err);
            } catch (wrapError: any) {
                errorMessage += wrapError.message;
            }
            throw new VError(errorMessage);
        }
    }
    async *getIncidents(createdAt?: Date): AsyncGenerator<Incident> {
        let offset = 0;
        do {
            const response = await this.restClient.get<
                PaginateResponse<Incident>
            >(
                `v1/incidents?sort=createdAt&order=asc&limit=${this.pageSize}&offset=${offset}`
            );
            for (const incident of response?.data?.data ?? []) {
                if (!createdAt || new Date(incident.createdAt) >= createdAt) {
                    const incidentItem = incident;
                    const timeLineResponse =
                        await this.restClient.get<IncidentTimeLinePaginateResponse>(
                            `v2/incident-timelines/${incident.id}/entries`
                        );
                    if (timeLineResponse.status === 200)
                        incidentItem.timelines =
                            timeLineResponse.data.data.entries;
                    const serviceNames: string[] = [];
                    for (const serviceId of incident.impactedServices ?? []) {
                        const serviceResponse = await this.restClient.get<any>(
                            `v1/services/${serviceId}`
                        );
                        serviceNames.push(serviceResponse.data.data.name);
                    }
                    incidentItem.impactedServices = serviceNames;
                    yield incidentItem;
                }
            }
            if (response?.data.totalCount > offset + this.pageSize)
                offset += this.pageSize;
            else break;
        } while (true);
    }

    async *getUsers(): AsyncGenerator<User> {
        const response = await this.restClient.get<PaginateResponse<User>>(
            'v2/users'
        );
        for (const user of response.data.data) {
            yield user;
        }
    }

    async *getTeams(): AsyncGenerator<Team> {
        const response = await this.restClient.get<PaginateResponse<Team>>(
            'v2/teams'
        );
        for (const team of response.data.data) {
            yield team;
        }
    }
    async *getServices(): AsyncGenerator<Service> {
        const response = await this.restClient.get<PaginateResponse<Service>>(
            'v1/services'
        );
        for (const service of response.data.data) {
            yield service;
        }
    }
}
