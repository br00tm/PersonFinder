/**
 * Entidade Company seguindo DDD
 * Representa uma empresa no domínio da aplicação
 */
export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly domain: string,
    public readonly website?: string,
    public readonly industry?: string,
    public readonly size?: string,
    public readonly location?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Domain logic
  static validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  getEmailDomain(): string {
    return this.domain;
  }

  // Factory method
  static create(data: {
    name: string;
    domain: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
  }): Company {
    const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!Company.validateDomain(data.domain)) {
      throw new Error('Domínio da empresa inválido');
    }

    return new Company(
      id,
      data.name,
      data.domain,
      data.website,
      data.industry,
      data.size,
      data.location
    );
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
