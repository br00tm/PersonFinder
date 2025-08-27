/**
 * Entidade Company seguindo DDD
 * Representa uma empresa no domínio da aplicação
 */
export declare class Company {
    readonly id: string;
    readonly name: string;
    readonly domain: string;
    readonly website?: string | undefined;
    readonly industry?: string | undefined;
    readonly size?: string | undefined;
    readonly location?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, domain: string, website?: string | undefined, industry?: string | undefined, size?: string | undefined, location?: string | undefined, createdAt?: Date, updatedAt?: Date);
    static validateDomain(domain: string): boolean;
    getEmailDomain(): string;
    static create(data: {
        name: string;
        domain: string;
        website?: string;
        industry?: string;
        size?: string;
        location?: string;
    }): Company;
    toJSON(): {
        id: string;
        name: string;
        domain: string;
        website: string | undefined;
        industry: string | undefined;
        size: string | undefined;
        location: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    };
}
//# sourceMappingURL=Company.d.ts.map