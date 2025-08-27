import { PersonSearchService } from '../domain/services/PersonSearchService.js';
import type { ExternalPersonSearchProvider } from '../domain/services/PersonSearchService.js';
import type { PersonRepository } from '../domain/repositories/PersonRepository.js';
import { SearchPersonUseCase } from '../application/usecases/SearchPersonUseCase.js';
import { SearchController } from '../presentation/controllers/SearchController.js';

import { ClearbitProvider } from '../infrastructure/providers/ClearbitProvider.js';
import { HunterProvider } from '../infrastructure/providers/HunterProvider.js';
import { MockProvider } from '../infrastructure/providers/MockProvider.js';
import { BasicProvider } from '../infrastructure/providers/BasicProvider.js';
import { InMemoryPersonRepository } from '../infrastructure/repositories/InMemoryPersonRepository.js';

/**
 * Container de dependências seguindo princípios SOLID
 * Implementa Dependency Injection para desacoplamento
 */
export class Container {
  private static instance: Container;
  
  private _personRepository!: PersonRepository;
  private _personSearchService!: PersonSearchService;
  private _searchPersonUseCase!: SearchPersonUseCase;
  private _searchController!: SearchController;

  private constructor() {
    this.setupDependencies();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private setupDependencies(): void {
    // Repositórios
    this._personRepository = new InMemoryPersonRepository();

    // Provedores externos
    const providers = this.createProviders();
    this._personSearchService = new PersonSearchService(providers);

    // Casos de uso
    this._searchPersonUseCase = new SearchPersonUseCase(
      this._personSearchService,
      this._personRepository
    );

    // Controllers
    this._searchController = new SearchController(
      this._searchPersonUseCase
    );
  }

  private createProviders(): ExternalPersonSearchProvider[] {
    const providers: ExternalPersonSearchProvider[] = [];

    // Adiciona Clearbit se tiver API key
    const clearbitApiKey = process.env.CLEARBIT_API_KEY;
    if (clearbitApiKey && clearbitApiKey.trim() !== '') {
      console.log('✅ Clearbit API configurada');
      providers.push(new ClearbitProvider(clearbitApiKey));
    } else {
      console.log('⚠️  Clearbit API não configurada (defina CLEARBIT_API_KEY)');
    }

    // Adiciona Hunter se tiver API key
    const hunterApiKey = process.env.HUNTER_API_KEY;
    if (hunterApiKey && hunterApiKey.trim() !== '') {
      console.log('✅ Hunter API configurada');
      providers.push(new HunterProvider(hunterApiKey));
    } else {
      console.log('⚠️  Hunter API não configurada (defina HUNTER_API_KEY)');
    }

    // Sempre adiciona o BasicProvider que funciona sem API keys
    console.log('✅ BasicProvider configurado (funciona sem API keys)');
    providers.push(new BasicProvider());

    // Se nenhum provedor real estiver configurado, informa como melhorar
    if (providers.length === 1) { // Apenas BasicProvider
      console.log('💡 Para resultados mais precisos, configure APIs:');
      console.log('   - CLEARBIT_API_KEY (https://clearbit.com/)');
      console.log('   - HUNTER_API_KEY (https://hunter.io/)');
    }

    return providers;
  }

  // Getters para acesso às dependências
  get personRepository(): PersonRepository {
    return this._personRepository;
  }

  get personSearchService(): PersonSearchService {
    return this._personSearchService;
  }

  get searchPersonUseCase(): SearchPersonUseCase {
    return this._searchPersonUseCase;
  }

  get searchController(): SearchController {
    return this._searchController;
  }

  // Método para reconfigurar em testes
  reconfigure(overrides: Partial<{
    personRepository: PersonRepository;
    providers: ExternalPersonSearchProvider[];
  }>): void {
    if (overrides.personRepository) {
      this._personRepository = overrides.personRepository;
    }

    if (overrides.providers) {
      this._personSearchService = new PersonSearchService(overrides.providers);
    }

    // Reconstrói casos de uso e controllers
    this._searchPersonUseCase = new SearchPersonUseCase(
      this._personSearchService,
      this._personRepository
    );

    this._searchController = new SearchController(
      this._searchPersonUseCase
    );
  }
}
