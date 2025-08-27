import { Company } from '../entities/Company.js';
/**
 * Interface do repositório de Company seguindo DDD
 * Define o contrato para persistência de dados de empresas
 */
export interface CompanyRepository {
    findById(id: string): Promise<Company | null>;
    findByName(name: string): Promise<Company | null>;
    findByDomain(domain: string): Promise<Company | null>;
    save(company: Company): Promise<Company>;
    update(company: Company): Promise<Company>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=CompanyRepository.d.ts.map