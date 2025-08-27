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
export class PersonSearchService {
  constructor(
    private readonly providers: ExternalPersonSearchProvider[]
  ) {}

  async searchByEmail(email: string): Promise<Person | null> {
    // Valida email antes de buscar
    if (!Person.validateEmail(email)) {
      throw new Error('Email inválido');
    }

    // Busca em múltiplos provedores para aumentar chances de sucesso (resiliência)
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.searchByEmail(email))
    );

    // Combina resultados de múltiplos provedores
    const combinedData = this.combineResults(results);
    
    if (!combinedData || !combinedData.name) {
      return null;
    }

    return Person.create({
      name: combinedData.name,
      email: combinedData.email || email,
      ...(combinedData.company && { company: combinedData.company }),
      ...(combinedData.instagram && { instagram: combinedData.instagram }),
      ...(combinedData.whatsapp && { whatsapp: combinedData.whatsapp }),
      ...(combinedData.linkedIn && { linkedIn: combinedData.linkedIn }),
      ...(combinedData.twitter && { twitter: combinedData.twitter }),
      ...(combinedData.phone && { phone: combinedData.phone })
    });
  }

  async searchByCompany(companyName: string): Promise<Person[]> {
    if (!companyName.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }

    const results = await Promise.allSettled(
      this.providers.map(provider => provider.searchByCompany(companyName))
    );

    const persons: Person[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        for (const personData of result.value) {
          if (personData.name) {
            try {
              const person = Person.create({
                name: personData.name,
                ...(personData.email && { email: personData.email }),
                company: personData.company || companyName,
                ...(personData.instagram && { instagram: personData.instagram }),
                ...(personData.whatsapp && { whatsapp: personData.whatsapp }),
                ...(personData.linkedIn && { linkedIn: personData.linkedIn }),
                ...(personData.twitter && { twitter: personData.twitter }),
                ...(personData.phone && { phone: personData.phone })
              });
              persons.push(person);
            } catch (error) {
              // Log error mas continua processando outros resultados
              console.warn('Erro ao criar pessoa:', error);
            }
          }
        }
      }
    }

    return persons;
  }

  private combineResults(results: PromiseSettledResult<Partial<Person> | null>[]): Partial<Person> | null {
    const combinedData: any = {};
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value;
        
        // Estratégia: primeiro resultado não nulo vence
        combinedData.name = combinedData.name || data.name;
        combinedData.email = combinedData.email || data.email;
        combinedData.company = combinedData.company || data.company;
        combinedData.instagram = combinedData.instagram || data.instagram;
        combinedData.whatsapp = combinedData.whatsapp || data.whatsapp;
        combinedData.linkedIn = combinedData.linkedIn || data.linkedIn;
        combinedData.twitter = combinedData.twitter || data.twitter;
        combinedData.phone = combinedData.phone || data.phone;
      }
    }

    return Object.keys(combinedData).length > 0 ? combinedData : null;
  }
}
