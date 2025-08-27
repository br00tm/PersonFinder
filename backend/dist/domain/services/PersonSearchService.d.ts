import { Person } from '../entities/Person.js';
/**
 * Interface para serviços externos de busca de pessoas
 * Seguindo o princípio da Inversão de Dependência (DIP)
 */
export interface ExternalPersonSearchProvider {
    searchByEmail(email: string): Promise<Partial<Person> | null>;
    searchByCompany(companyName: string): Promise<Partial<Person>[]>;
    searchByName(name: string): Promise<Partial<Person>[]>;
}
/**
 * Serviço de domínio para busca de pessoas
 * Orquestra múltiplos provedores de busca
 */
export declare class PersonSearchService {
    private readonly providers;
    constructor(providers: ExternalPersonSearchProvider[]);
    searchByEmail(email: string): Promise<Person | null>;
    searchByCompany(companyName: string): Promise<Person[]>;
    private combineResults;
}
//# sourceMappingURL=PersonSearchService.d.ts.map