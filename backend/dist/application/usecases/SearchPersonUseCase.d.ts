import { Person } from '../../domain/entities/Person.js';
import { PersonSearchService } from '../../domain/services/PersonSearchService.js';
import { PersonRepository } from '../../domain/repositories/PersonRepository.js';
/**
 * DTOs para o caso de uso
 */
export interface SearchPersonRequest {
    query: string;
    type: 'email' | 'company';
}
export interface SearchPersonResponse {
    success: boolean;
    data?: Person | Person[];
    error?: string;
    cached?: boolean;
}
/**
 * Caso de uso para busca de pessoas
 * Implementa a lógica de aplicação seguindo princípios SOLID
 */
export declare class SearchPersonUseCase {
    private readonly personSearchService;
    private readonly personRepository;
    constructor(personSearchService: PersonSearchService, personRepository: PersonRepository);
    execute(request: SearchPersonRequest): Promise<SearchPersonResponse>;
    private isRecentData;
}
//# sourceMappingURL=SearchPersonUseCase.d.ts.map