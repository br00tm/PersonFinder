import axios, { AxiosInstance } from 'axios';
import { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';
/**
 * Implementação do provedor Hunter.io para busca de pessoas
 * Focado em buscar emails e informações por empresa
 */
export class HunterProvider {
    apiKey;
    client;
    failureCount = 0;
    lastFailureTime = 0;
    maxFailures = 5;
    circuitBreakerTimeout = 60000;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL: 'https://api.hunter.io/v2',
            timeout: 10000,
            headers: {
                'User-Agent': 'PersonFinder/1.0'
            }
        });
        // Interceptor para retry
        this.client.interceptors.response.use(response => response, async (error) => {
            if (error.config && !error.config.__retryCount) {
                error.config.__retryCount = 0;
            }
            const shouldRetry = error.config.__retryCount < 3 &&
                error.response?.status >= 500;
            if (shouldRetry) {
                error.config.__retryCount++;
                const delay = Math.pow(2, error.config.__retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.client.request(error.config);
            }
            return Promise.reject(error);
        });
    }
    async searchByEmail(email) {
        if (this.isCircuitBreakerOpen()) {
            console.warn('Hunter circuit breaker aberto, pulando busca');
            return null;
        }
        try {
            const response = await this.client.get('/email-verifier', {
                params: {
                    email,
                    api_key: this.apiKey
                }
            });
            this.onSuccess();
            const data = response.data.data;
            if (data.result !== 'deliverable') {
                return null;
            }
            // Hunter retorna informações limitadas sobre a pessoa
            return {
                email: data.email,
                name: data.first_name && data.last_name ?
                    `${data.first_name} ${data.last_name}` : undefined
            };
        }
        catch (error) {
            this.onFailure();
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return null;
                }
            }
            console.error('Erro na verificação Hunter:', error);
            return null;
        }
    }
    async searchByCompany(companyName) {
        if (this.isCircuitBreakerOpen()) {
            console.warn('Hunter circuit breaker aberto, pulando busca');
            return [];
        }
        try {
            // Primeiro tenta encontrar o domínio da empresa
            const domainResponse = await this.client.get('/domain-search', {
                params: {
                    company: companyName,
                    api_key: this.apiKey,
                    limit: 10
                }
            });
            this.onSuccess();
            const emails = domainResponse.data.data.emails;
            if (!emails || emails.length === 0) {
                return [];
            }
            const persons = [];
            for (const emailData of emails) {
                if (emailData.first_name && emailData.last_name) {
                    persons.push({
                        name: `${emailData.first_name} ${emailData.last_name}`,
                        email: emailData.value,
                        company: companyName
                    });
                }
            }
            return persons;
        }
        catch (error) {
            this.onFailure();
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return [];
                }
            }
            console.error('Erro na busca de empresa Hunter:', error);
            return [];
        }
    }
    async searchByName(name) {
        // Hunter não suporta busca por nome diretamente
        return [];
    }
    isCircuitBreakerOpen() {
        if (this.failureCount < this.maxFailures) {
            return false;
        }
        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        if (timeSinceLastFailure > this.circuitBreakerTimeout) {
            this.failureCount = 0;
            return false;
        }
        return true;
    }
    onSuccess() {
        this.failureCount = 0;
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
    }
}
//# sourceMappingURL=HunterProvider.js.map