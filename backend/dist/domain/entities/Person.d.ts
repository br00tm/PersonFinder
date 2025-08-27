/**
 * Entidade Person seguindo DDD
 * Representa uma pessoa no domínio da aplicação
 */
export declare class Person {
    readonly id: string;
    readonly name: string;
    readonly email?: string | undefined;
    readonly company?: string | undefined;
    readonly instagram?: string | undefined;
    readonly whatsapp?: string | undefined;
    readonly linkedIn?: string | undefined;
    readonly twitter?: string | undefined;
    readonly phone?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, email?: string | undefined, company?: string | undefined, instagram?: string | undefined, whatsapp?: string | undefined, linkedIn?: string | undefined, twitter?: string | undefined, phone?: string | undefined, createdAt?: Date, updatedAt?: Date);
    static validateEmail(email: string): boolean;
    static validatePhone(phone: string): boolean;
    hasContactInfo(): boolean;
    hasSocialMedia(): boolean;
    static create(data: {
        name: string;
        email?: string;
        company?: string;
        instagram?: string;
        whatsapp?: string;
        linkedIn?: string;
        twitter?: string;
        phone?: string;
    }): Person;
    toJSON(): {
        id: string;
        name: string;
        email: string | undefined;
        company: string | undefined;
        instagram: string | undefined;
        whatsapp: string | undefined;
        linkedIn: string | undefined;
        twitter: string | undefined;
        phone: string | undefined;
        hasContactInfo: boolean;
        hasSocialMedia: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
//# sourceMappingURL=Person.d.ts.map