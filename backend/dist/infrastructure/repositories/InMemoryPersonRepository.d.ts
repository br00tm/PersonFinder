import { Person } from '../../domain/entities/Person.js';
import { PersonRepository } from '../../domain/repositories/PersonRepository.js';
/**
 * Implementação em memória do PersonRepository
 * Para desenvolvimento e testes
 */
export declare class InMemoryPersonRepository implements PersonRepository {
    private persons;
    findById(id: string): Promise<Person | null>;
    findByEmail(email: string): Promise<Person | null>;
    findByCompany(companyName: string): Promise<Person[]>;
    save(person: Person): Promise<Person>;
    update(person: Person): Promise<Person>;
    delete(id: string): Promise<void>;
    clear(): void;
    getAll(): Person[];
}
//# sourceMappingURL=InMemoryPersonRepository.d.ts.map