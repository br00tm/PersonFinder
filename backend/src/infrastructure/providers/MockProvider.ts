import type { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';

/**
 * Provedor vazio - não retorna dados fictícios
 * Usado apenas como fallback quando APIs reais não estão configuradas
 */
export class MockProvider implements ExternalPersonSearchProvider {

  async searchByEmail(email: string): Promise<Partial<Person> | null> {
    // MockProvider não retorna dados - apenas para fallback
    console.log(`MockProvider: Nenhum dado encontrado para email ${email}`);
    return null;
  }

  async searchByCompany(companyName: string): Promise<Partial<Person>[]> {
    // MockProvider não retorna dados - apenas para fallback
    console.log(`MockProvider: Nenhum dado encontrado para empresa ${companyName}`);
    return [];
  }

  async searchByName(name: string): Promise<Partial<Person>[]> {
    // MockProvider não retorna dados - apenas para fallback
    console.log(`MockProvider: Nenhum dado encontrado para nome ${name}`);
    return [];
  }
}
