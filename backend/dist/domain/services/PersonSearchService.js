import { Person } from '../entities/Person.js';
/**
 * Serviço de domínio para busca de pessoas
 * Orquestra múltiplos provedores de busca
 */
export class PersonSearchService {
    providers;
    constructor(providers) {
        this.providers = providers;
    }
    async searchByEmail(email) {
        // Valida email antes de buscar
        if (!Person.validateEmail(email)) {
            throw new Error('Email inválido');
        }
        // Busca em múltiplos provedores para aumentar chances de sucesso (resiliência)
        const results = await Promise.allSettled(this.providers.map(provider => provider.searchByEmail(email)));
        // Combina resultados de múltiplos provedores
        const combinedData = this.combineResults(results);
        if (!combinedData || !combinedData.name) {
            return null;
        }
        return Person.create({
            name: combinedData.name,
            email: combinedData.email || email,
            company: combinedData.company,
            instagram: combinedData.instagram,
            whatsapp: combinedData.whatsapp,
            linkedIn: combinedData.linkedIn,
            twitter: combinedData.twitter,
            phone: combinedData.phone
        });
    }
    async searchByCompany(companyName) {
        if (!companyName.trim()) {
            throw new Error('Nome da empresa é obrigatório');
        }
        const results = await Promise.allSettled(this.providers.map(provider => provider.searchByCompany(companyName)));
        const persons = [];
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                for (const personData of result.value) {
                    if (personData.name) {
                        try {
                            const person = Person.create({
                                name: personData.name,
                                email: personData.email,
                                company: personData.company || companyName,
                                instagram: personData.instagram,
                                whatsapp: personData.whatsapp,
                                linkedIn: personData.linkedIn,
                                twitter: personData.twitter,
                                phone: personData.phone
                            });
                            persons.push(person);
                        }
                        catch (error) {
                            // Log error mas continua processando outros resultados
                            console.warn('Erro ao criar pessoa:', error);
                        }
                    }
                }
            }
        }
        return persons;
    }
    combineResults(results) {
        const combinedData = {};
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                const data = result.value;
                // Estratégia: primeiro resultado não nulo vence
                combinedData.name = combinedData.name || data.name;
                combinedData.email = combinedData.email || data.email;
                combinedData.company = combinedData.company || data.company;
                combinedData.instagram = combinedData.instagram || data.instagram;
                combinedData.whatsapp = combinedData.whatsapp || data.whatsapp;
                combinedData.linkedIn = combinedData.linkedIn || data.linkedIn;
                combinedData.twitter = combinedData.twitter || data.twitter;
                combinedData.phone = combinedData.phone || data.phone;
            }
        }
        return Object.keys(combinedData).length > 0 ? combinedData : null;
    }
}
//# sourceMappingURL=PersonSearchService.js.map