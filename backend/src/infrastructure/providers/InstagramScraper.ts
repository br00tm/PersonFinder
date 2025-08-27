import axios from 'axios';
import type { AxiosInstance } from 'axios';

/**
 * Instagram Scraper para buscar seguidores de empresas
 * Usa métodos éticos e APIs públicas
 */
export class InstagramScraper {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
  }

  /**
   * Aguarda um tempo especificado (para evitar rate limiting)
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Busca o Instagram oficial da empresa
   */
  async findCompanyInstagram(companyName: string): Promise<string | null> {
    console.log(`🔍 Procurando Instagram oficial da ${companyName}`);
    
    try {
      // Estratégia 1: Buscar no Google pelo Instagram da empresa
      const googleResult = await this.searchCompanyOnGoogle(companyName);
      if (googleResult) return googleResult;

      // Estratégia 2: Tentar usernames comuns
      const commonUsernames = this.generatePossibleUsernames(companyName);
      for (const username of commonUsernames) {
        const exists = await this.checkInstagramExists(username);
        if (exists) {
          console.log(`✅ Instagram da empresa encontrado: @${username}`);
          return username;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar Instagram da empresa:', error);
      return null;
    }
  }

  /**
   * Busca uma pessoa específica nos seguidores de uma empresa
   */
  async findPersonInFollowers(companyUsername: string, personName: string): Promise<string | null> {
    console.log(`👥 Buscando "${personName}" nos seguidores de @${companyUsername}`);
    
    try {
      // Estratégia 1: Usar API pública do Instagram (limitada mas funcional)
      const publicApiResult = await this.searchViaPublicAPI(companyUsername, personName);
      if (publicApiResult) return publicApiResult;

      // Estratégia 2: Buscar via hashtags e menções
      const hashtagResult = await this.searchViaHashtagsAndMentions(companyUsername, personName);
      if (hashtagResult) return hashtagResult;

      // Estratégia 3: Buscar posts da empresa que marcam funcionários
      const postsResult = await this.searchInCompanyPosts(companyUsername, personName);
      if (postsResult) return postsResult;

      return null;
    } catch (error) {
      console.error('Erro ao buscar pessoa nos seguidores:', error);
      return null;
    }
  }

  private async searchCompanyOnGoogle(companyName: string): Promise<string | null> {
    console.log(`🔍 Buscando Instagram de "${companyName}" via buscadores...`);
    
    try {
      // Múltiplas estratégias de busca
      const searchQueries = [
        `"${companyName}" instagram oficial site:instagram.com`,
        `"${companyName}" instagram site:instagram.com`,
        `${companyName} instagram oficial`,
        `${companyName} instagram perfil`,
        `${companyName} redes sociais instagram`,
        `instagram ${companyName}`,
        // Busca por palavras-chave da empresa
        ...this.generateSearchKeywords(companyName).map(keyword => 
          `"${keyword}" instagram site:instagram.com`
        )
      ];
      
      for (const query of searchQueries) {
        console.log(`🔎 Tentativa de busca: ${query}`);
        
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        try {
          const response = await this.client.get(searchUrl, { timeout: 5000 });
          const results = response.data.Results || [];
          
          for (const result of results) {
            const url = result.FirstURL || '';
            const text = (result.Text || '').toLowerCase();
            
            if (url.includes('instagram.com/')) {
              const match = url.match(/instagram\.com\/([^\/\?]+)/);
              if (match && match[1]) {
                const username = match[1];
                
                // Verifica se parece ser da empresa
                if (this.couldBeCompanyUsername(username, companyName)) {
                  console.log(`✅ Instagram da empresa encontrado via busca: @${username}`);
                  return username;
                }
              }
            }
          }
          
          // Aguarda entre requisições para evitar rate limiting
          await this.delay(500);
        } catch (searchError) {
          console.log(`❌ Erro na busca "${query}":`, searchError);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro na busca por buscadores:', error);
      return null;
    }
  }

  /**
   * Gera palavras-chave para busca baseadas no nome da empresa
   */
  private generateSearchKeywords(companyName: string): string[] {
    const words = companyName.toLowerCase()
      .replace(/\b(ltda|ltd|s\.?a\.?|me|mei|eireli|sociedade|empresa|tecnologia|tech|sistemas|system|soluções|solutions|serviços|services|comercio|comercial|industria|industrial|consultoria|group|grupo)\b/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // Apenas palavras significativas
    
    const keywords = new Set<string>();
    
    // Palavra principal (primeira)
    if (words[0]) keywords.add(words[0]);
    
    // Combinações de 2 palavras
    for (let i = 0; i < words.length - 1; i++) {
      keywords.add(`${words[i]} ${words[i + 1]}`);
    }
    
    // Nome completo limpo
    if (words.length > 1) {
      keywords.add(words.join(' '));
    }
    
    return Array.from(keywords);
  }

  /**
   * Verifica se um username pode pertencer a uma empresa específica
   */
  private couldBeCompanyUsername(username: string, companyName: string): boolean {
    const cleanUsername = username.toLowerCase().replace(/[._-]/g, '');
    const cleanCompany = companyName.toLowerCase()
      .replace(/\b(ltda|ltd|s\.?a\.?|me|mei|eireli|sociedade|empresa|tecnologia|tech|sistemas|system|soluções|solutions|serviços|services|comercio|comercial|industria|industrial|consultoria|group|grupo)\b/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '');
    
    const words = cleanCompany.split(/\s+/).filter(w => w.length > 2);
    
    let score = 0;
    
    // Verifica se contém palavra principal da empresa
    if (words.length > 0 && words[0] && cleanUsername.includes(words[0])) {
      score += 5;
    }
    
    // Verifica se contém outras palavras importantes
    for (const word of words.slice(1)) {
      if (cleanUsername.includes(word)) {
        score += 3;
      }
    }
    
    // Verifica se contém nome completo da empresa
    if (cleanUsername.includes(cleanCompany)) {
      score += 7;
    }
    
    // Verifica se contém iniciais
    if (words.length > 1) {
      const initials = words.map(w => w.charAt(0)).join('');
      if (cleanUsername.includes(initials)) {
        score += 4;
      }
    }
    
    // Penaliza usernames muito genéricos ou pessoais
    const personalIndicators = ['personal', 'oficial', 'admin', 'user'];
    if (personalIndicators.some(indicator => cleanUsername.includes(indicator))) {
      // Não penaliza "oficial" pois pode ser da empresa
      if (!cleanUsername.includes('oficial')) {
        score -= 2;
      }
    }
    
    const isMatch = score >= 5;
    
    if (isMatch) {
      console.log(`🏢 Username empresarial potencial: @${username} para ${companyName} (score: ${score})`);
    }
    
    return isMatch;
  }

  private generatePossibleUsernames(companyName: string): string[] {
    const originalName = companyName.toLowerCase();
    
    // Remove palavras comuns de empresas
    const cleanedName = originalName
      .replace(/\b(ltda|ltd|s\.?a\.?|me|mei|eireli|sociedade|empresa|tecnologia|tech|sistemas|system|soluções|solutions|serviços|services|comercio|comercial|industria|industrial|consultoria|group|grupo)\b/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const clean = cleanedName.replace(/\s/g, '');
    const words = cleanedName.split(' ').filter(w => w.length > 0);
    
    const variations = new Set<string>();
    
    // 1. Nome limpo básico
    variations.add(clean);
    
    // 2. Variações com sufixos oficiais
    variations.add(`${clean}oficial`);
    variations.add(`${clean}_oficial`);
    variations.add(`${clean}.oficial`);
    variations.add(`oficial${clean}`);
    variations.add(`${clean}br`);
    variations.add(`${clean}_br`);
    
    // 3. Variações com separadores
    variations.add(cleanedName.replace(/\s/g, '_'));
    variations.add(cleanedName.replace(/\s/g, '.'));
    variations.add(cleanedName.replace(/\s/g, ''));
    
    // 4. Siglas e abreviações
    if (words.length > 1) {
      const initials = words.map(w => w.charAt(0)).join('');
      variations.add(initials);
      variations.add(`${initials}oficial`);
      variations.add(`${initials}_oficial`);
      variations.add(`${initials}br`);
      
      // Combinar primeira palavra com iniciais das outras
      if (words[0]) {
        const firstWordWithInitials = words[0] + words.slice(1).map(w => w.charAt(0)).join('');
        variations.add(firstWordWithInitials);
      }
    }
    
    // 5. Apenas primeira palavra (marca principal)
    if (words.length > 0 && words[0]) {
      const mainBrand = words[0];
      variations.add(mainBrand);
      variations.add(`${mainBrand}oficial`);
      variations.add(`${mainBrand}_oficial`);
      variations.add(`${mainBrand}br`);
      variations.add(`${mainBrand}_br`);
    }
    
    // 6. Variações com sufixos técnicos
    variations.add(`${clean}tech`);
    variations.add(`${clean}_tech`);
    variations.add(`${clean}company`);
    variations.add(`${clean}_company`);
    variations.add(`${clean}corp`);
    variations.add(`${clean}_corp`);
    
    // 7. Variações com número (comum em empresas)
    for (let i = 1; i <= 3; i++) {
      variations.add(`${clean}${i}`);
      variations.add(`${clean}_${i}`);
    }
    
    // 8. Variações do nome original sem limpeza (caso a empresa use nome completo)
    const originalClean = originalName.replace(/[^a-z0-9]/g, '');
    variations.add(originalClean);
    variations.add(originalName.replace(/\s/g, ''));
    variations.add(originalName.replace(/\s/g, '_'));
    
    return Array.from(variations).filter(v => v.length >= 2); // Remove usernames muito curtos
  }

  private async checkInstagramExists(username: string): Promise<boolean> {
    try {
      const response = await this.client.get(`https://www.instagram.com/${username}/`, {
        validateStatus: (status) => status < 500
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async searchViaPublicAPI(companyUsername: string, personName: string): Promise<string | null> {
    try {
      console.log(`📱 Buscando via API pública: ${personName} relacionado a @${companyUsername}`);
      
      // Usa endpoint público do Instagram (limitado)
      const response = await this.client.get(`https://www.instagram.com/${companyUsername}/`, {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const html = response.data;
      
      // Procura por dados estruturados no HTML
      const jsonMatch = html.match(/window\._sharedData = ({.*?});/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          // Processa dados para encontrar seguidores ou menções
          const followers = this.extractFollowersFromData(data, personName);
          return followers;
        } catch (parseError) {
          console.log('Erro ao parsear dados do Instagram');
        }
      }

      return null;
    } catch (error) {
      console.log('API pública não acessível, tentando métodos alternativos...');
      return null;
    }
  }

  private async searchViaHashtagsAndMentions(companyUsername: string, personName: string): Promise<string | null> {
    try {
      console.log(`#️⃣ Buscando via hashtags: ${personName} + ${companyUsername}`);
      
      const nameParts = personName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      const searchQueries = [
        `"${firstName}" "${lastName}" "@${companyUsername}" instagram`,
        `"${personName}" "@${companyUsername}" instagram`,
        `${firstName} ${lastName} ${companyUsername} instagram seguidores`,
        `"${firstName}" "${companyUsername}" instagram funcionario`,
      ];

      for (const query of searchQueries) {
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        const response = await this.client.get(searchUrl);
        const results = response.data.Results || [];
        
        for (const result of results) {
          const text = (result.Text || '').toLowerCase();
          const url = result.FirstURL || '';
          
          // Procura por Instagram URLs que não sejam da empresa
          if (url.includes('instagram.com/') && !url.includes(companyUsername)) {
            const match = url.match(/instagram\.com\/([^\/\?]+)/);
            if (match && match[1]) {
              const username = match[1];
              
              // Verifica se o username pode ser da pessoa
              if (this.couldBePersonUsername(username, personName)) {
                console.log(`✅ Possível Instagram encontrado: @${username}`);
                return `@${username}`;
              }
            }
          }
          
          // Procura por menções @username no texto
          const mentions = text.match(/@([a-zA-Z0-9_.]+)/g);
          if (mentions) {
            for (const mention of mentions) {
              const username = mention.substring(1);
              if (username !== companyUsername && this.couldBePersonUsername(username, personName)) {
                console.log(`✅ Instagram encontrado via menção: @${username}`);
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

  private async searchInCompanyPosts(companyUsername: string, personName: string): Promise<string | null> {
    try {
      console.log(`📸 Analisando posts de @${companyUsername} procurando por ${personName}`);
      
      const nameParts = personName.split(' ');
      const searchTerms = [
        personName,
        `${nameParts[0]} ${nameParts[nameParts.length - 1]}`, // Primeiro e último nome
        nameParts[0], // Apenas primeiro nome
        nameParts[nameParts.length - 1], // Apenas último nome
      ];

      for (const term of searchTerms) {
        const query = `site:instagram.com/${companyUsername} "${term}"`;
        const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        
        const response = await this.client.get(searchUrl);
        const results = response.data.Results || [];
        
        for (const result of results) {
          const text = result.Text || '';
          const snippet = result.Snippet || '';
          const combinedText = `${text} ${snippet}`.toLowerCase();
          
          // Procura por @mentions no contexto dos posts
          const mentions = combinedText.match(/@([a-zA-Z0-9_.]+)/g);
          if (mentions) {
            for (const mention of mentions) {
              const username = mention.substring(1);
              if (username !== companyUsername && this.couldBePersonUsername(username, personName)) {
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

  private extractFollowersFromData(data: any, personName: string): string | null {
    try {
      // Esta função processaria dados estruturados do Instagram
      // Em uma implementação real, você analisaria a estrutura específica dos dados
      console.log('Analisando dados estruturados do Instagram...');
      
      // Placeholder para processamento de dados reais
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se um username pode pertencer a uma pessoa específica
   * Usa algoritmo inteligente que considera variações criativas
   */
  private couldBePersonUsername(username: string, personName: string): boolean {
    const nameParts = personName.toLowerCase().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return false;

    const cleanUsername = username.toLowerCase().replace(/[._-]/g, '');
    let score = 0;
    
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? (nameParts[nameParts.length - 1] || '') : firstName;
    const middleName = nameParts.length > 2 ? (nameParts[1] || '') : '';

    if (!firstName) return false;

    // Padrões de score para diferentes tipos de correspondência
    
    // 1. Nome completo ou partes no username
    if (firstName && cleanUsername.includes(firstName)) score += 3;
    if (lastName && cleanUsername.includes(lastName)) score += 4; // Sobrenome tem peso maior
    if (middleName && cleanUsername.includes(middleName)) score += 2;

    // 2. Iniciais + sobrenome (como "p_brito", "pl_brito")
    const initials = nameParts.map(part => part.charAt(0)).join('');
    if (cleanUsername.includes(initials)) score += 3;
    if (firstName && lastName && cleanUsername.includes(firstName.charAt(0) + lastName)) score += 4;

    // 3. Sobrenome + números ou sufixos (como "brito123", "brito_rx")
    if (lastName && (cleanUsername.startsWith(lastName) || cleanUsername.endsWith(lastName))) score += 5;
    if (firstName && (cleanUsername.startsWith(firstName) || cleanUsername.endsWith(firstName))) score += 3;

    // 4. Combinações criativas
    const creativePatterns: string[] = [];
    
    if (firstName && lastName) {
      creativePatterns.push(
        `${firstName}${lastName}`,
        `${lastName}${firstName}`,
        `${firstName.charAt(0)}${lastName}`,
        `${firstName}${lastName.charAt(0)}`,
        `${lastName}${firstName.charAt(0)}`,
        lastName,
        firstName
      );
    }

    for (const pattern of creativePatterns) {
      if (pattern && cleanUsername.includes(pattern)) {
        score += 4;
        break;
      }
    }

    // 5. Verifica se o username é muito genérico ou comum
    const genericUsernames = ['admin', 'user', 'test', 'oficial', 'company', 'brand'];
    if (genericUsernames.some(generic => cleanUsername.includes(generic))) {
      score -= 5;
    }

    const isMatch = score >= 6; // Threshold ajustado

    if (isMatch) {
      console.log(`🎯 Username potencial: @${username} para ${personName} (score: ${score})`);
    }

    return isMatch;
  }
}
