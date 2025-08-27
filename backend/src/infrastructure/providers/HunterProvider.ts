import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';

/**
 * Implementação do provedor Hunter.io para busca de pessoas
 * Focado em buscar emails e informações por empresa
 */
export class HunterProvider implements ExternalPersonSearchProvider {
  private readonly client: AxiosInstance;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly circuitBreakerTimeout = 60000;

  constructor(private readonly apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.hunter.io/v2',
      timeout: 10000,
      headers: {
        'User-Agent': 'PersonFinder/1.0'
      }
    });

    // Interceptor para retry
    this.client.interceptors.response.use(
      response => response,
      async error => {
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
      }
    );
  }

  async searchByEmail(email: string): Promise<Partial<Person> | null> {
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
        ...(data.first_name && data.last_name && { name: `${data.first_name} ${data.last_name}` })
      };

    } catch (error) {
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

  async searchByCompany(companyName: string): Promise<Partial<Person>[]> {
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

      const persons: Partial<Person>[] = [];

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

    } catch (error) {
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

  async searchByName(name: string): Promise<Partial<Person>[]> {
    // Hunter não suporta busca por nome diretamente
    return [];
  }

  private isCircuitBreakerOpen(): boolean {
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

  private onSuccess(): void {
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }
}
