import { PersonSearchService, ExternalPersonSearchProvider } from '../domain/services/PersonSearchService.js';
import { PersonRepository } from '../domain/repositories/PersonRepository.js';
import { SearchPersonUseCase } from '../application/usecases/SearchPersonUseCase.js';
import { SearchController } from '../presentation/controllers/SearchController.js';
/**
 * Container de dependências seguindo princípios SOLID
 * Implementa Dependency Injection para desacoplamento
 */
export declare class Container {
    private static instance;
    private _personRepository;
    private _personSearchService;
    private _searchPersonUseCase;
    private _searchController;
    private constructor();
    static getInstance(): Container;
    private setupDependencies;
    private createProviders;
    get personRepository(): PersonRepository;
    get personSearchService(): PersonSearchService;
    get searchPersonUseCase(): SearchPersonUseCase;
    get searchController(): SearchController;
    reconfigure(overrides: Partial<{
        personRepository: PersonRepository;
        providers: ExternalPersonSearchProvider[];
    }>): void;
}
//# sourceMappingURL=container.d.ts.map