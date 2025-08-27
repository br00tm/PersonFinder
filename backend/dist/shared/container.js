import { PersonSearchService, ExternalPersonSearchProvider } from '../domain/services/PersonSearchService.js';
import { PersonRepository } from '../domain/repositories/PersonRepository.js';
import { SearchPersonUseCase } from '../application/usecases/SearchPersonUseCase.js';
import { SearchController } from '../presentation/controllers/SearchController.js';
import { ClearbitProvider } from '../infrastructure/providers/ClearbitProvider.js';
import { HunterProvider } from '../infrastructure/providers/HunterProvider.js';
import { MockProvider } from '../infrastructure/providers/MockProvider.js';
import { InMemoryPersonRepository } from '../infrastructure/repositories/InMemoryPersonRepository.js';
/**
 * Container de dependências seguindo princípios SOLID
 * Implementa Dependency Injection para desacoplamento
 */
export class Container {
    static instance;
    _personRepository;
    _personSearchService;
    _searchPersonUseCase;
    _searchController;
    constructor() {
        this.setupDependencies();
    }
    static getInstance() {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }
    setupDependencies() {
        // Repositórios
        this._personRepository = new InMemoryPersonRepository();
        // Provedores externos
        const providers = this.createProviders();
        this._personSearchService = new PersonSearchService(providers);
        // Casos de uso
        this._searchPersonUseCase = new SearchPersonUseCase(this._personSearchService, this._personRepository);
        // Controllers
        this._searchController = new SearchController(this._searchPersonUseCase);
    }
    createProviders() {
        const providers = [];
        // Sempre adiciona o provider mock para fallback
        providers.push(new MockProvider());
        // Adiciona Clearbit se tiver API key
        const clearbitApiKey = process.env.CLEARBIT_API_KEY;
        if (clearbitApiKey) {
            providers.push(new ClearbitProvider(clearbitApiKey));
        }
        // Adiciona Hunter se tiver API key
        const hunterApiKey = process.env.HUNTER_API_KEY;
        if (hunterApiKey) {
            providers.push(new HunterProvider(hunterApiKey));
        }
        return providers;
    }
    // Getters para acesso às dependências
    get personRepository() {
        return this._personRepository;
    }
    get personSearchService() {
        return this._personSearchService;
    }
    get searchPersonUseCase() {
        return this._searchPersonUseCase;
    }
    get searchController() {
        return this._searchController;
    }
    // Método para reconfigurar em testes
    reconfigure(overrides) {
        if (overrides.personRepository) {
            this._personRepository = overrides.personRepository;
        }
        if (overrides.providers) {
            this._personSearchService = new PersonSearchService(overrides.providers);
        }
        // Reconstrói casos de uso e controllers
        this._searchPersonUseCase = new SearchPersonUseCase(this._personSearchService, this._personRepository);
        this._searchController = new SearchController(this._searchPersonUseCase);
    }
}
//# sourceMappingURL=container.js.map