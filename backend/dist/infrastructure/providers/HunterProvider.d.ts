import { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';
/**
 * Implementação do provedor Hunter.io para busca de pessoas
 * Focado em buscar emails e informações por empresa
 */
export declare class HunterProvider implements ExternalPersonSearchProvider {
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
//# sourceMappingURL=HunterProvider.d.ts.map