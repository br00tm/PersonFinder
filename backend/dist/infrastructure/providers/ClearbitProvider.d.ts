import { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';
/**
 * Implementação do provedor Clearbit para busca de pessoas
 * Implementa circuit breaker e retry para resiliência
 */
export declare class ClearbitProvider implements ExternalPersonSearchProvider {
    private readonly apiKey;
    private readonly client;
    private failureCount;
    private lastFailureTime;
    private readonly maxFailures;
    private readonly circuitBreakerTimeout;
    constructor(apiKey: string);
    searchByEmail(email: string): Promise<Partial<Person> | null>;
    searchByCompany(companyName: string): Promise<Partial<Person>[]>;
    searchByName(name: string): Promise<Partial<Person>[]>;
    private isCircuitBreakerOpen;
    private onSuccess;
    private onFailure;
}
//# sourceMappingURL=ClearbitProvider.d.ts.map