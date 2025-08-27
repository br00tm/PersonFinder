import type { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import { Person } from '../../domain/entities/Person.js';

/**
 * Provedor mock para desenvolvimento e testes
 * Simula dados realistas para demonstração
 */
export class MockProvider implements ExternalPersonSearchProvider {
  private readonly mockData = [
    {
      name: 'Matheus Gomes',
      email: 'matheus.gomes@elroma.com.br',
      company: 'Elroma',
      instagram: 'matheus_gomes_dev',
      whatsapp: '+5511999887766',
      linkedIn: 'https://linkedin.com/in/matheus-gomes-dev',
      twitter: 'https://twitter.com/matheus_dev',
      phone: '+5511999887766'
    },
    {
      name: 'Ana Silva',
      email: 'ana.silva@elroma.com.br',
      company: 'Elroma',
      instagram: 'ana_silva_design',
      whatsapp: '+5511888776655',
      linkedIn: 'https://linkedin.com/in/ana-silva-design'
    },
    {
      name: 'João Santos',
      email: 'joao.santos@techcorp.com',
      company: 'TechCorp',
      instagram: 'joao_tech',
      whatsapp: '+5511777665544',
      phone: '+5511777665544'
    }
  ];

  async searchByEmail(email: string): Promise<Partial<Person> | null> {
    // Simula delay de rede
    await this.delay(500);

    const result = this.mockData.find(person => 
      person.email.toLowerCase() === email.toLowerCase()
    );

    if (!result) {
      // Para emails não encontrados, gera dados fictícios baseados no domínio
      const domain = email.split('@')[1];
      const emailPart = email.split('@')[0];
      if (!emailPart || !domain) return null;
      const name = emailPart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        name,
        email,
        company: domain?.split('.')[0]?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Company',
        instagram: `${name.toLowerCase().replace(/\s/g, '_')}_insta`,
        whatsapp: `+5511${Math.floor(Math.random() * 900000000 + 100000000)}`
      };
    }

    return result;
  }

  async searchByCompany(companyName: string): Promise<Partial<Person>[]> {
    await this.delay(800);

    const results = this.mockData.filter(person => 
      person.company.toLowerCase().includes(companyName.toLowerCase())
    );

    if (results.length === 0) {
      // Gera dados fictícios para empresas não encontradas
      const mockEmployees = [
        {
          name: `João ${companyName}`,
          email: `joao@${companyName.toLowerCase()}.com`,
          company: companyName,
          instagram: `joao_${companyName.toLowerCase()}`,
          whatsapp: `+5511${Math.floor(Math.random() * 900000000 + 100000000)}`
        },
        {
          name: `Maria ${companyName}`,
          email: `maria@${companyName.toLowerCase()}.com`,
          company: companyName,
          instagram: `maria_${companyName.toLowerCase()}`,
          whatsapp: `+5511${Math.floor(Math.random() * 900000000 + 100000000)}`
        }
      ];

      return mockEmployees;
    }

    return results;
  }

  async searchByName(name: string): Promise<Partial<Person>[]> {
    await this.delay(600);

    const results = this.mockData.filter(person => 
      person.name.toLowerCase().includes(name.toLowerCase())
    );

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
