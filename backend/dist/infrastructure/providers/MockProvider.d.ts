import { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';
/**
 * Provedor mock para desenvolvimento e testes
 * Simula dados realistas para demonstração
 */
export declare class MockProvider implements ExternalPersonSearchProvider {
    private readonly mockData;
    searchByEmail(email: string): Promise<Partial<Person> | null>;
    searchByCompany(companyName: string): Promise<Partial<Person>[]>;
    searchByName(name: string): Promise<Partial<Person>[]>;
    private delay;
}
//# sourceMappingURL=MockProvider.d.ts.map