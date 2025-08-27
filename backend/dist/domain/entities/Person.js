/**
 * Entidade Person seguindo DDD
 * Representa uma pessoa no domínio da aplicação
 */
export class Person {
    id;
    name;
    email;
    company;
    instagram;
    whatsapp;
    linkedIn;
    twitter;
    phone;
    createdAt;
    updatedAt;
    constructor(id, name, email, company, instagram, whatsapp, linkedIn, twitter, phone, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.company = company;
        this.instagram = instagram;
        this.whatsapp = whatsapp;
        this.linkedIn = linkedIn;
        this.twitter = twitter;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    // Value Objects
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    }
    // Domain logic
    hasContactInfo() {
        return !!(this.whatsapp || this.phone || this.email);
    }
    hasSocialMedia() {
        return !!(this.instagram || this.linkedIn || this.twitter);
    }
    // Factory method
    static create(data) {
        const id = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (data.email && !Person.validateEmail(data.email)) {
            throw new Error('Email inválido');
        }
        if (data.phone && !Person.validatePhone(data.phone)) {
            throw new Error('Telefone inválido');
        }
        return new Person(id, data.name, data.email, data.company, data.instagram, data.whatsapp, data.linkedIn, data.twitter, data.phone);
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            company: this.company,
            instagram: this.instagram,
            whatsapp: this.whatsapp,
            linkedIn: this.linkedIn,
            twitter: this.twitter,
            phone: this.phone,
            hasContactInfo: this.hasContactInfo(),
            hasSocialMedia: this.hasSocialMedia(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
//# sourceMappingURL=Person.js.map