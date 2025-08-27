import { Person } from '../../domain/entities/Person.js';
import type { PersonRepository } from '../../domain/repositories/PersonRepository.js';

/**
 * Implementação em memória do PersonRepository
 * Para desenvolvimento e testes
 */
export class InMemoryPersonRepository implements PersonRepository {
  private persons: Map<string, Person> = new Map();

  async findById(id: string): Promise<Person | null> {
    const person = this.persons.get(id);
    return person || null;
  }

  async findByEmail(email: string): Promise<Person | null> {
    for (const person of this.persons.values()) {
      if (person.email?.toLowerCase() === email.toLowerCase()) {
        return person;
      }
    }
    return null;
  }

  async findByCompany(companyName: string): Promise<Person[]> {
    const result: Person[] = [];
    
    for (const person of this.persons.values()) {
      if (person.company?.toLowerCase().includes(companyName.toLowerCase())) {
        result.push(person);
      }
    }
    
    return result;
  }

  async save(person: Person): Promise<Person> {
    this.persons.set(person.id, person);
    return person;
  }

  async update(person: Person): Promise<Person> {
    if (!this.persons.has(person.id)) {
      throw new Error(`Pessoa com ID ${person.id} não encontrada`);
    }
    
    this.persons.set(person.id, person);
    return person;
  }

  async delete(id: string): Promise<void> {
    this.persons.delete(id);
  }

  // Método auxiliar para testes
  clear(): void {
    this.persons.clear();
  }

  // Método auxiliar para ver todos os dados
  getAll(): Person[] {
    return Array.from(this.persons.values());
  }
}
