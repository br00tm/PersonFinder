/**
 * Entidade Person seguindo DDD
 * Representa uma pessoa no domínio da aplicação
 */
export class Person {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email?: string,
    public readonly company?: string,
    public readonly instagram?: string,
    public readonly whatsapp?: string,
    public readonly linkedIn?: string,
    public readonly twitter?: string,
    public readonly phone?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Value Objects
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  }

  // Domain logic
  hasContactInfo(): boolean {
    return !!(this.whatsapp || this.phone || this.email);
  }

  hasSocialMedia(): boolean {
    return !!(this.instagram || this.linkedIn || this.twitter);
  }

  // Factory method
  static create(data: {
    name: string;
    email?: string;
    company?: string;
    instagram?: string;
    whatsapp?: string;
    linkedIn?: string;
    twitter?: string;
    phone?: string;
  }): Person {
    const id = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (data.email && !Person.validateEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.phone && !Person.validatePhone(data.phone)) {
      throw new Error('Telefone inválido');
    }

    return new Person(
      id,
      data.name,
      data.email,
      data.company,
      data.instagram,
      data.whatsapp,
      data.linkedIn,
      data.twitter,
      data.phone
    );
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
