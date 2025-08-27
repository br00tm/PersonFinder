import { Person } from '../../domain/entities/Person.js';
import { PersonRepository } from '../../domain/repositories/PersonRepository.js';
/**
 * Implementação em memória do PersonRepository
 * Para desenvolvimento e testes
 */
export class InMemoryPersonRepository {
    persons = new Map();
    async findById(id) {
        const person = this.persons.get(id);
        return person || null;
    }
    async findByEmail(email) {
        for (const person of this.persons.values()) {
            if (person.email?.toLowerCase() === email.toLowerCase()) {
                return person;
            }
        }
        return null;
    }
    async findByCompany(companyName) {
        const result = [];
        for (const person of this.persons.values()) {
            if (person.company?.toLowerCase().includes(companyName.toLowerCase())) {
                result.push(person);
            }
        }
        return result;
    }
    async save(person) {
        this.persons.set(person.id, person);
        return person;
    }
    async update(person) {
        if (!this.persons.has(person.id)) {
            throw new Error(`Pessoa com ID ${person.id} não encontrada`);
        }
        this.persons.set(person.id, person);
        return person;
    }
    async delete(id) {
        this.persons.delete(id);
    }
    // Método auxiliar para testes
    clear() {
        this.persons.clear();
    }
    // Método auxiliar para ver todos os dados
    getAll() {
        return Array.from(this.persons.values());
    }
}
//# sourceMappingURL=InMemoryPersonRepository.js.map