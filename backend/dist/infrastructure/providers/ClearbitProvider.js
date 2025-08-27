import axios, { AxiosInstance } from 'axios';
import { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';
/**
 * Implementação do provedor Clearbit para busca de pessoas
 * Implementa circuit breaker e retry para resiliência
 */
export class ClearbitProvider {
    apiKey;
    client;
    failureCount = 0;
    lastFailureTime = 0;
    maxFailures = 5;
    circuitBreakerTimeout = 60000; // 1 minuto
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios.create({
            timeout: 10000, // 10 segundos timeout
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'PersonFinder/1.0'
            }
        });
        // Interceptor para retry automático
        this.client.interceptors.response.use(response => response, async (error) => {
            if (error.config && !error.config.__retryCount) {
                error.config.__retryCount = 0;
            }
            const shouldRetry = error.config.__retryCount < 3 &&
                error.response?.status >= 500;
            if (shouldRetry) {
                error.config.__retryCount++;
                // Backoff exponencial
                const delay = Math.pow(2, error.config.__retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.client.request(error.config);
            }
            return Promise.reject(error);
        });
    }
    async searchByEmail(email) {
        if (this.isCircuitBreakerOpen()) {
            console.warn('Clearbit circuit breaker aberto, pulando busca');
            return null;
        }
        try {
            const response = await this.client.get(`https://person.clearbit.com/v2/combined/find?email=${encodeURIComponent(email)}`);
            this.onSuccess();
            const data = response.data;
            const person = data.person;
            const company = data.company;
            if (!person)
                return null;
            return {
                name: person.name?.fullName || `${person.name?.givenName} ${person.name?.familyName}`.trim(),
                email: person.email,
                company: company?.name,
                linkedIn: person.linkedin?.handle ? `https://linkedin.com/in/${person.linkedin.handle}` : undefined,
                twitter: person.twitter?.handle ? `https://twitter.com/${person.twitter.handle}` : undefined,
                phone: person.phone
            };
        }
        catch (error) {
            this.onFailure();
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    // 404 não é erro do sistema, apenas não encontrou
                    return null;
                }
                if (error.response?.status === 429) {
                    console.warn('Rate limit atingido no Clearbit');
                    return null;
                }
            }
            console.error('Erro na busca Clearbit:', error);
            return null;
        }
    }
    async searchByCompany(companyName) {
        if (this.isCircuitBreakerOpen()) {
            console.warn('Clearbit circuit breaker aberto, pulando busca');
            return [];
        }
        try {
            // Clearbit não tem endpoint direto para buscar pessoas por empresa
            // Implementamos busca por domínio da empresa
            const companyResponse = await this.client.get(`https://company.clearbit.com/v2/companies/find?name=${encodeURIComponent(companyName)}`);
            this.onSuccess();
            const company = companyResponse.data;
            if (!company?.domain)
                return [];
            // Busca funcionários conhecidos (limitado pela API)
            return [];
        }
        catch (error) {
            this.onFailure();
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return [];
                }
            }
            console.error('Erro na busca de empresa Clearbit:', error);
            return [];
        }
    }
    async searchByName(name) {
        // Clearbit não suporta busca por nome diretamente
        return [];
    }
    isCircuitBreakerOpen() {
        if (this.failureCount < this.maxFailures) {
            return false;
        }
        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        if (timeSinceLastFailure > this.circuitBreakerTimeout) {
            // Reset circuit breaker após timeout
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
//# sourceMappingURL=ClearbitProvider.js.map