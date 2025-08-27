import { Person } from '../entities/Person.js';
/**
 * Interface do repositório de Person seguindo DDD
 * Define o contrato para persistência de dados de pessoas
 */
export interface PersonRepository {
    findById(id: string): Promise<Person | null>;
    findByEmail(email: string): Promise<Person | null>;
    findByCompany(companyName: string): Promise<Person[]>;
    save(person: Person): Promise<Person>;
    update(person: Person): Promise<Person>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=PersonRepository.d.ts.map