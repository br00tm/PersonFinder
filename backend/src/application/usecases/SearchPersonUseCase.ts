import { Person } from '../../domain/entities/Person.js';
import { PersonSearchService } from '../../domain/services/PersonSearchService.js';
import type { PersonRepository } from '../../domain/repositories/PersonRepository.js';

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
export class SearchPersonUseCase {
  constructor(
    private readonly personSearchService: PersonSearchService,
    private readonly personRepository: PersonRepository
  ) {}

  async execute(request: SearchPersonRequest): Promise<SearchPersonResponse> {
    try {
      // Validação de entrada
      if (!request.query?.trim()) {
        return {
          success: false,
          error: 'Query de busca é obrigatória'
        };
      }

      if (!['email', 'company'].includes(request.type)) {
        return {
          success: false,
          error: 'Tipo de busca deve ser "email" ou "company"'
        };
      }

      // Tenta buscar no cache primeiro (otimização de performance)
      let cachedResult: Person | Person[] | null = null;
      
      if (request.type === 'email') {
        cachedResult = await this.personRepository.findByEmail(request.query);
      } else {
        cachedResult = await this.personRepository.findByCompany(request.query);
      }

      // Se encontrou no cache e não está muito antigo, retorna
      if (cachedResult) {
        const isArray = Array.isArray(cachedResult);
        const shouldUseCache = isArray ? 
          (cachedResult as Person[]).length > 0 : 
          this.isRecentData(cachedResult as Person);

        if (shouldUseCache) {
          return {
            success: true,
            data: cachedResult,
            cached: true
          };
        }
      }

      // Busca externa
      let searchResult: Person | Person[] | null;
      
      if (request.type === 'email') {
        searchResult = await this.personSearchService.searchByEmail(request.query);
      } else {
        searchResult = await this.personSearchService.searchByCompany(request.query);
      }

      if (!searchResult) {
        return {
          success: false,
          error: 'Nenhuma informação encontrada'
        };
      }

      // Salva resultado no cache para futuras buscas
      if (Array.isArray(searchResult)) {
        await Promise.allSettled(
          searchResult.map(person => this.personRepository.save(person))
        );
      } else {
        await this.personRepository.save(searchResult);
      }

      return {
        success: true,
        data: searchResult,
        cached: false
      };

    } catch (error) {
      console.error('Erro no caso de uso SearchPerson:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  private isRecentData(person: Person): boolean {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return person.updatedAt > thirtyMinutesAgo;
  }
}
