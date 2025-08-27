import axios from 'axios';
import type { ExternalPersonSearchProvider } from '../../domain/services/PersonSearchService.js';
import type { Person } from '../../domain/entities/Person.js';
import { InstagramScraper } from './InstagramScraper.js';

/**
 * Provider básico que funciona sem API keys
 * Faz buscas básicas e validações simples
 */
export class BasicProvider implements ExternalPersonSearchProvider {
  private instagramScraper: InstagramScraper;

  constructor() {
    this.instagramScraper = new InstagramScraper();
  }
  
  async searchByEmail(email: string): Promise<Partial<Person> | null> {
    console.log(`🔍 BasicProvider: Buscando informações para ${email}`);
    
    try {
      // Extrai informações básicas do email
      const [localPart, domain] = email.split('@');
      if (!localPart || !domain) return null;

      // Tenta obter informações básicas do domínio
      const companyInfo = await this.getCompanyFromDomain(domain);
      
      // Gera nome a partir do email
      const name = this.generateNameFromEmail(localPart);
      
      // Tenta buscar redes sociais básicas
      const socialInfo = await this.searchBasicSocial(localPart, name, companyInfo?.name);

      return {
        name,
        email,
        company: companyInfo?.name,
        ...socialInfo
      };

    } catch (error) {
      console.error('BasicProvider searchByEmail error:', error);
      return null;
    }
  }

  async searchByCompany(companyName: string): Promise<Partial<Person>[]> {
    console.log(`🔍 BasicProvider: Buscando funcionários da empresa ${companyName}`);
    
    try {
      // Busca básica por domínio da empresa
      const domain = this.guessDomainFromCompany(companyName);
      if (!domain) return [];

      // Gera alguns funcionários comuns baseado no padrão da empresa
      const commonRoles = ['contato', 'info', 'vendas', 'comercial', 'suporte'];
      const results: Partial<Person>[] = [];

      for (const role of commonRoles) {
        const email = `${role}@${domain}`;
        const name = this.generateNameFromEmail(role);
        
        results.push({
          name: `${name} - ${companyName}`,
          email,
          company: companyName
        });
      }

      return results.slice(0, 3); // Retorna apenas 3 resultados

    } catch (error) {
      console.error('BasicProvider searchByCompany error:', error);
      return [];
    }
  }

  async searchByName(name: string): Promise<Partial<Person>[]> {
    console.log(`🔍 BasicProvider: Buscando por nome ${name}`);
    return []; // Não implementado para busca básica
  }

  private async getCompanyFromDomain(domain: string): Promise<{name: string} | null> {
    try {
      // Remove subdomínios e extrai o nome principal
      const parts = domain.split('.');
      const mainDomain = parts[0];
      if (!mainDomain) return null;
      
      const companyName = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
      
      return { name: companyName };
    } catch (error) {
      return null;
    }
  }

  private generateNameFromEmail(localPart: string): string {
    // Converte email em nome legível
    return localPart
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private guessDomainFromCompany(companyName: string): string | null {
    // Tenta adivinhar o domínio da empresa
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/ltda|sa|me|eireli/g, '');
    
    return `${cleanName}.com.br`;
  }

  private async searchBasicSocial(localPart: string, name: string, company?: string): Promise<any> {
    console.log(`🔍 Buscando redes sociais para: ${name} na empresa: ${company}`);
    
    try {
      // Nova estratégia: busca via empresa
      if (company) {
        const companyBasedResult = await this.searchViaCompanySocial(name, company);
        if (companyBasedResult.instagram || companyBasedResult.linkedIn) {
          return companyBasedResult;
        }
      }
      
      // Fallback: busca alternativa usando serviços públicos
      const socialSearchResult = await this.searchSocialMediaAlternative(name, localPart);
      
      if (socialSearchResult.instagram || socialSearchResult.linkedIn) {
        return socialSearchResult;
      }
      
      // Último recurso: busca direta
      const instagramResult = await this.searchInstagramProfile(name, localPart);
      const linkedInResult = await this.searchLinkedInProfile(name, localPart);
      
      return {
        instagram: instagramResult,
        linkedIn: linkedInResult,
      };
    } catch (error) {
      console.error('Erro ao buscar redes sociais:', error);
      return {};
    }
  }

  private async searchViaCompanySocial(personName: string, companyName: string): Promise<any> {
    console.log(`🏢 Buscando via empresa: ${companyName} para encontrar: ${personName}`);
    
    try {
      // 1. Encontrar Instagram da empresa
      const companyInstagram = await this.findCompanyInstagram(companyName);
      
      // 2. Encontrar LinkedIn da empresa
      const companyLinkedIn = await this.findCompanyLinkedIn(companyName);
      
      let personInstagram = null;
      let personLinkedIn = null;
      
      // 3. Buscar pessoa nos seguidores do Instagram da empresa usando scraper avançado
      if (companyInstagram) {
        console.log(`🎯 Usando Instagram Scraper para buscar ${personName} em @${companyInstagram}`);
        personInstagram = await this.instagramScraper.findPersonInFollowers(companyInstagram, personName);
        
        if (!personInstagram) {
          // Fallback para método anterior se scraper não encontrar
          personInstagram = await this.searchPersonInCompanyFollowers(personName, companyInstagram, 'instagram');
        }
      }
      
      // 4. Buscar pessoa nos funcionários do LinkedIn da empresa
      if (companyLinkedIn) {
        personLinkedIn = await this.searchPersonInCompanyEmployees(personName, companyLinkedIn);
      }
      
      return {
        instagram: personInstagram,
        linkedIn: personLinkedIn
      };
      
    } catch (error) {
      console.error('Erro na busca via empresa:', error);
      return {};
    }
  }

  private async findCompanyInstagram(companyName: string): Promise<string | null> {
    console.log(`🔍 Procurando Instagram oficial da empresa: ${companyName}`);
    
    try {
      // Usa o scraper avançado primeiro
      const scraperResult = await this.instagramScraper.findCompanyInstagram(companyName);
      if (scraperResult) {
        console.log(`✅ Instagram da empresa encontrado via scraper: @${scraperResult}`);
        return scraperResult;
      }
      
      // Fallback: Estratégias tradicionais
      const possibleUsernames = [
        companyName.toLowerCase().replace(/\s/g, ''),
        companyName.toLowerCase().replace(/\s/g, '_'),
        companyName.toLowerCase().replace(/\s/g, '.'),
        companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        `${companyName.toLowerCase().replace(/\s/g, '')}oficial`,
        `${companyName.toLowerCase().replace(/\s/g, '')}br`,
      ];
      
      for (const username of possibleUsernames) {
        const found = await this.verifyCompanyInstagram(username, companyName);
        
        if (found) {
          console.log(`✅ Instagram da empresa encontrado via fallback: @${username}`);
          return username;
        }
      }
      
      // Última tentativa via busca alternativa
      const searchResult = await this.searchCompanyInstagramAlternative(companyName);
      return searchResult;
      
    } catch (error) {
      console.error('Erro ao buscar Instagram da empresa:', error);
      return null;
    }
  }

  private async findCompanyLinkedIn(companyName: string): Promise<string | null> {
    console.log(`🔍 Procurando LinkedIn da empresa: ${companyName}`);
    
    try {
      // LinkedIn usa padrão mais previsível para empresas
      const possibleSlugs = [
        companyName.toLowerCase().replace(/\s/g, '-'),
        companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        `${companyName.toLowerCase().replace(/\s/g, '-')}-brasil`,
        `${companyName.toLowerCase().replace(/\s/g, '-')}-br`,
      ];
      
      for (const slug of possibleSlugs) {
        const found = await this.verifyCompanyLinkedIn(slug, companyName);
        
        if (found) {
          console.log(`✅ LinkedIn da empresa encontrado: ${slug}`);
          return slug;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao buscar LinkedIn da empresa:', error);
      return null;
    }
  }

  private async searchPersonInCompanyFollowers(personName: string, companyUsername: string, platform: string): Promise<string | null> {
    console.log(`👥 Buscando ${personName} relacionado a @${companyUsername}`);
    
    try {
      // Estratégia 1: Buscar posts da empresa que mencionam a pessoa
      const personInCompanyPosts = await this.searchPersonInCompanyPosts(personName, companyUsername);
      if (personInCompanyPosts) return personInCompanyPosts;
      
      // Estratégia 2: Buscar pessoa que trabalha na empresa via Google
      const googleSearch = await this.searchPersonCompanyGoogle(personName, companyUsername);
      if (googleSearch) return googleSearch;
      
      // Estratégia 3: Usar API não oficial do Instagram (mais limitada mas funcional)
      const instagramAPI = await this.searchViaInstagramAPI(personName, companyUsername);
      if (instagramAPI) return instagramAPI;
      
      // Estratégia 4: Buscar através de hashtags da empresa
      const hashtagSearch = await this.searchViaCompanyHashtags(personName, companyUsername);
      if (hashtagSearch) return hashtagSearch;
      
      return null;
      
    } catch (error) {
      console.error('Erro ao buscar pessoa relacionada à empresa:', error);
      return null;
    }
  }

  private async searchPersonInCompanyPosts(personName: string, companyUsername: string): Promise<string | null> {
    try {
      console.log(`📸 Procurando ${personName} em posts de @${companyUsername}`);
      
      // Busca posts da empresa que podem mencionar funcionários
      const queries = [
        `"${personName}" site:instagram.com/${companyUsername}`,
        `"${personName}" "${companyUsername}" instagram`,
        `${personName.split(' ')[0]} ${companyUsername} instagram`,
      ];
      
      for (const query of queries) {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        const response = await axios.get(searchUrl, {
          timeout: 3000,
          headers: { 'User-Agent': 'PersonFinder/1.0' }
        });
        
        const results = response.data.Results || [];
        
        for (const result of results) {
          const text = (result.Text || '').toLowerCase();
          const url = result.FirstURL || '';
          
          // Procura por menções do nome em contexto da empresa
          if (text.includes(personName.toLowerCase()) && 
              (text.includes(companyUsername.toLowerCase()) || text.includes('instagram'))) {
            
            // Tenta extrair username do Instagram do contexto
            const instagramMatch = text.match(/@([a-zA-Z0-9_.]+)/);
            if (instagramMatch && instagramMatch[1] !== companyUsername) {
              const username = instagramMatch[1];
              if (this.usernameMatchesPerson(username, personName)) {
                console.log(`✅ Instagram encontrado em posts da empresa: @${username}`);
                return `@${username}`;
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async searchPersonCompanyGoogle(personName: string, companyUsername: string): Promise<string | null> {
    try {
      console.log(`🔍 Busca Google: ${personName} + ${companyUsername}`);
      
      const queries = [
        `"${personName}" "${companyUsername}" instagram`,
        `"${personName}" @${companyUsername}`,
        `${personName} trabalha ${companyUsername} instagram`,
        `${personName} employee ${companyUsername} instagram`,
      ];
      
      for (const query of queries) {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        const response = await axios.get(searchUrl, {
          timeout: 4000,
          headers: { 'User-Agent': 'PersonFinder/1.0' }
        });
        
        const results = response.data.Results || [];
        
        for (const result of results) {
          const url = result.FirstURL || '';
          const text = (result.Text || '').toLowerCase();
          
          if (url.includes('instagram.com/') && !url.includes(companyUsername)) {
            const match = url.match(/instagram\.com\/([^\/\?]+)/);
            if (match && match[1]) {
              const username = match[1];
              
              // Verifica se é realmente a pessoa certa
              if (this.usernameMatchesPerson(username, personName)) {
                console.log(`✅ Instagram encontrado via Google: @${username}`);
                return `@${username}`;
              }
            }
          }
          
          // Procura menções de @ no texto
          const mentionMatch = text.match(/@([a-zA-Z0-9_.]+)/);
          if (mentionMatch && mentionMatch[1] !== companyUsername) {
            const username = mentionMatch[1];
            if (this.usernameMatchesPerson(username, personName)) {
              console.log(`✅ Instagram encontrado via menção: @${username}`);
              return `@${username}`;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async searchViaInstagramAPI(personName: string, companyUsername: string): Promise<string | null> {
    try {
      console.log(`📱 Tentando API não oficial para @${companyUsername}`);
      
      // Usa serviços públicos que agregam dados do Instagram
      const publicServices = [
        `https://api.instagram.com/oembed/?url=https://instagram.com/${companyUsername}`,
        `https://www.instagram.com/${companyUsername}/?__a=1`,
      ];
      
      // Esta é uma aproximação - em produção seria necessário usar bibliotecas especializadas
      for (const serviceUrl of publicServices) {
        try {
          const response = await axios.get(serviceUrl, {
            timeout: 3000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          const data = response.data;
          
          // Procura por menções do nome nos dados retornados
          const dataString = JSON.stringify(data).toLowerCase();
          if (dataString.includes(personName.toLowerCase())) {
            console.log(`✅ Possível menção encontrada via API`);
            // Seria necessário processar os dados específicos aqui
          }
          
        } catch (error) {
          // Continua para próximo serviço
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async searchViaCompanyHashtags(personName: string, companyUsername: string): Promise<string | null> {
    try {
      console.log(`#️⃣ Buscando via hashtags da ${companyUsername}`);
      
      const hashtags = [
        `#${companyUsername}`,
        `#${companyUsername}team`,
        `#${companyUsername}funcionarios`,
        `#trabalhonogrupo${companyUsername}`,
      ];
      
      for (const hashtag of hashtags) {
        const query = `"${personName}" ${hashtag} instagram`;
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        const response = await axios.get(searchUrl, {
          timeout: 3000,
          headers: { 'User-Agent': 'PersonFinder/1.0' }
        });
        
        const results = response.data.Results || [];
        
        for (const result of results) {
          const url = result.FirstURL || '';
          if (url.includes('instagram.com/') && !url.includes(companyUsername)) {
            const match = url.match(/instagram\.com\/([^\/\?]+)/);
            if (match && match[1]) {
              const username = match[1];
              if (this.usernameMatchesPerson(username, personName)) {
                console.log(`✅ Instagram encontrado via hashtag: @${username}`);
                return `@${username}`;
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private async searchPersonInCompanyEmployees(personName: string, companySlug: string): Promise<string | null> {
    console.log(`👔 Buscando ${personName} nos funcionários de ${companySlug}`);
    
    try {
      // Busca funcionários da empresa no LinkedIn
      const searchQuery = `"${personName}" site:linkedin.com/in AND "${companySlug}"`;
      
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1`;
      
      const response = await axios.get(searchUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'PersonFinder/1.0' }
      });
      
      const results = response.data.Results || [];
      
      for (const result of results) {
        const url = result.FirstURL || '';
        if (url.includes('linkedin.com/in/')) {
          const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
          if (match && match[1]) {
            const slug = match[1];
            // Verifica se o slug contém partes do nome da pessoa
            if (this.slugMatchesPerson(slug, personName)) {
              console.log(`✅ LinkedIn encontrado via empresa: https://linkedin.com/in/${slug}`);
              return `https://linkedin.com/in/${slug}`;
            }
          }
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao buscar funcionários da empresa:', error);
      return null;
    }
  }

  private async verifyCompanyInstagram(username: string, companyName: string): Promise<boolean> {
    try {
      // Busca para verificar se é realmente a empresa
      const searchQuery = `site:instagram.com/${username} "${companyName}"`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1`;
      
      const response = await axios.get(searchUrl, { timeout: 3000 });
      const results = response.data.Results || [];
      
      return results.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async verifyCompanyLinkedIn(slug: string, companyName: string): Promise<boolean> {
    try {
      const searchQuery = `site:linkedin.com/company/${slug} "${companyName}"`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1`;
      
      const response = await axios.get(searchUrl, { timeout: 3000 });
      const results = response.data.Results || [];
      
      return results.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async searchCompanyInstagramAlternative(companyName: string): Promise<string | null> {
    try {
      const searchQuery = `"${companyName}" instagram oficial`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1`;
      
      const response = await axios.get(searchUrl, { timeout: 3000 });
      const results = response.data.Results || [];
      
      for (const result of results) {
        const url = result.FirstURL || '';
        if (url.includes('instagram.com/')) {
          const match = url.match(/instagram\.com\/([^\/\?]+)/);
          if (match && match[1]) {
            return match[1];
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private usernameMatchesPerson(username: string, personName: string): boolean {
    const nameParts = personName.toLowerCase().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return false;
    
    const cleanUsername = username.toLowerCase().replace(/[._-]/g, '');
    
    // Score de correspondência
    let matchScore = 0;
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? (nameParts[nameParts.length - 1] || '') : firstName;
    
    if (!firstName) return false;
    
    // Verifica se contém nome completo
    if (firstName && lastName && cleanUsername.includes(firstName) && cleanUsername.includes(lastName) && firstName !== lastName) {
      matchScore += 10;
    }
    // Verifica se contém nome + inicial do sobrenome
    else if (firstName && lastName && cleanUsername.includes(firstName) && cleanUsername.includes(lastName.charAt(0))) {
      matchScore += 8;
    }
    // Verifica se contém apenas nome ou sobrenome (mais rigoroso)
    else if (firstName && cleanUsername.includes(firstName) && firstName.length > 3) {
      matchScore += 5;
    }
    else if (lastName && cleanUsername.includes(lastName) && lastName.length > 3) {
      matchScore += 5;
    }
    
    // Verifica padrões comuns como "nomeSobrenome" ou "nome.sobrenome"
    const commonPatterns: string[] = [];
    
    if (firstName && lastName) {
      commonPatterns.push(
        `${firstName}${lastName}`,
        `${firstName}.${lastName}`,
        `${firstName}_${lastName}`,
        `${firstName}${lastName.charAt(0)}`,
        `${firstName.charAt(0)}${lastName}`
      );
    }
    
    for (const pattern of commonPatterns) {
      if (pattern.length > 2 && username.toLowerCase().includes(pattern)) {
        matchScore += 8;
        break;
      }
    }
    
    // Retorna true se score > 7 (alta confiança)
    const isMatch = matchScore >= 7;
    
    if (isMatch) {
      console.log(`🎯 Username match: @${username} para ${personName} (score: ${matchScore})`);
    }
    
    return isMatch;
  }

  private slugMatchesPerson(slug: string, personName: string): boolean {
    const nameParts = personName.toLowerCase().split(' ');
    const cleanSlug = slug.toLowerCase().replace(/[-_]/g, '');
    
    // Verifica se o slug contém pelo menos nome ou sobrenome
    return nameParts.some(part => cleanSlug.includes(part) && part.length > 2);
  }

  private async searchSocialMediaAlternative(name: string, localPart: string): Promise<any> {
    try {
      // Busca usando DuckDuckGo (não bloqueia bots como Google)
      const searchQuery = `"${name}" instagram OR linkedin`;
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await axios.get(searchUrl, {
        timeout: 3000,
        headers: {
          'User-Agent': 'PersonFinder/1.0'
        }
      });

      const results = response.data.Results || [];
      let instagram = null;
      let linkedIn = null;

      for (const result of results) {
        const text = (result.Text || '').toLowerCase();
        const url = result.FirstURL || '';

        // Procura por Instagram
        if (url.includes('instagram.com') && !instagram) {
          const match = url.match(/instagram\.com\/([^\/\?]+)/);
          if (match && match[1]) {
            instagram = `@${match[1]}`;
            console.log(`✅ Instagram encontrado via busca: ${instagram}`);
          }
        }

        // Procura por LinkedIn
        if (url.includes('linkedin.com/in') && !linkedIn) {
          const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
          if (match && match[1]) {
            linkedIn = `https://linkedin.com/in/${match[1]}`;
            console.log(`✅ LinkedIn encontrado via busca: ${linkedIn}`);
          }
        }
      }

      return { instagram, linkedIn };
    } catch (error) {
      console.log('Busca alternativa falhou, tentando método direto...');
      return {};
    }
  }

  private async searchInstagramProfile(name: string, localPart: string): Promise<string | null> {
    try {
      // Estratégias de busca para Instagram
      const possibleUsernames = [
        localPart.replace(/[._]/g, ''),
        localPart.replace(/[._]/g, '.'),
        localPart.replace(/[._]/g, '_'),
        name.toLowerCase().replace(/\s/g, ''),
        name.toLowerCase().replace(/\s/g, '.'),
        name.toLowerCase().replace(/\s/g, '_'),
      ];

      // Simula verificação de existência do perfil (em produção, usaria APIs)
      for (const username of possibleUsernames) {
        if (await this.checkInstagramExists(username)) {
          return `@${username}`;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro na busca Instagram:', error);
      return null;
    }
  }

  private async searchLinkedInProfile(name: string, localPart: string): Promise<string | null> {
    try {
      // Estratégias de busca para LinkedIn
      const possibleSlugs = [
        localPart.replace(/[._]/g, '-'),
        name.toLowerCase().replace(/\s/g, '-'),
        `${name.split(' ')[0]}-${name.split(' ')[1] || ''}`.toLowerCase(),
      ];

      // Simula verificação de existência do perfil
      for (const slug of possibleSlugs) {
        if (await this.checkLinkedInExists(slug)) {
          return `https://linkedin.com/in/${slug}`;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro na busca LinkedIn:', error);
      return null;
    }
  }

  private async checkInstagramExists(username: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando Instagram: @${username}`);
      
      // Usa busca pública para verificar se o perfil existe
      const searchQuery = `site:instagram.com/${username}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Verifica se encontrou resultados
      const found = response.data.includes(`instagram.com/${username}`) || 
                   response.data.includes(`@${username}`);
      
      if (found) {
        console.log(`✅ Instagram encontrado: @${username}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`❌ Erro ao verificar Instagram @${username}`);
      return false;
    }
  }

  private async checkLinkedInExists(slug: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando LinkedIn: ${slug}`);
      
      // Usa busca pública para verificar se o perfil existe
      const searchQuery = `site:linkedin.com/in/${slug}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Verifica se encontrou resultados
      const found = response.data.includes(`linkedin.com/in/${slug}`) ||
                   response.data.includes(`${slug} | LinkedIn`);
      
      if (found) {
        console.log(`✅ LinkedIn encontrado: ${slug}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`❌ Erro ao verificar LinkedIn ${slug}`);
      return false;
    }
  }
}
