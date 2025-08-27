/**
 * Entidade Company seguindo DDD
 * Representa uma empresa no domínio da aplicação
 */
export class Company {
    id;
    name;
    domain;
    website;
    industry;
    size;
    location;
    createdAt;
    updatedAt;
    constructor(id, name, domain, website, industry, size, location, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.name = name;
        this.domain = domain;
        this.website = website;
        this.industry = industry;
        this.size = size;
        this.location = location;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    // Domain logic
    static validateDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }
    getEmailDomain() {
        return this.domain;
    }
    // Factory method
    static create(data) {
        const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!Company.validateDomain(data.domain)) {
            throw new Error('Domínio da empresa inválido');
        }
        return new Company(id, data.name, data.domain, data.website, data.industry, data.size, data.location);
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            domain: this.domain,
            website: this.website,
            industry: this.industry,
            size: this.size,
            location: this.location,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
//# sourceMappingURL=Company.js.map