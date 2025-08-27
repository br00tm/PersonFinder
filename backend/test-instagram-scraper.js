const axios = require('axios');

/**
 * Teste específico para verificar o sistema de busca de Instagram da empresa
 */
async function testInstagramCompanySearch() {
  console.log('🧪 TESTE: Sistema de Busca de Instagram da Empresa');
  console.log('====================================================\n');

  const testCases = [
    {
      name: 'Elroma Tecnologia',
      expectedPatterns: ['elroma', 'elromatech', 'elroma_tech', 'elromaoficial', 'elroma_oficial', 'elromabr']
    },
    {
      name: 'Pedro Lucas Brito',
      person: true,
      expectedPatterns: ['pedro', 'lucas', 'brito', 'pedrobrito', 'britopedro', 'plbrito', 'brito_rx']
    }
  ];

  try {
    // Verifica se o servidor está rodando
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Servidor está rodando:', healthResponse.data);
    console.log('');

    for (const testCase of testCases) {
      console.log(`🔍 Testando: ${testCase.name}`);
      console.log('-------------------');
      
      if (testCase.person) {
        console.log(`📝 Padrões esperados para pessoa: ${testCase.expectedPatterns.join(', ')}`);
        console.log('🎯 Exemplo: Pedro Lucas Brito → @brito_rx (username criativo)');
      } else {
        console.log(`📝 Padrões esperados para empresa: ${testCase.expectedPatterns.join(', ')}`);
        console.log('🏢 Sistema deve encontrar Instagram oficial da empresa');
      }
      
      console.log('');
    }

    // Teste real com email
    console.log('🚀 TESTE REAL: pedro.lucas@elroma.com.br');
    console.log('=========================================');
    
    const testEmail = {
      query: "pedro.lucas@elroma.com.br",
      type: "email"
    };

    console.log('📤 Enviando requisição...');
    const response = await axios.post('http://localhost:3000/api/search', testEmail, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos para permitir busca completa
    });

    console.log('📥 Resposta recebida:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      const person = response.data.data;
      console.log('\n✅ RESULTADO DO TESTE:');
      console.log('=====================');
      console.log(`👤 Nome encontrado: ${person.name || 'N/A'}`);
      console.log(`🏢 Empresa: ${person.company || 'N/A'}`);
      console.log(`📸 Instagram: ${person.instagram || 'N/A'}`);
      console.log(`💼 LinkedIn: ${person.linkedIn || 'N/A'}`);
      
      if (person.instagram && person.instagram !== 'N/A') {
        console.log('\n🎉 SUCESSO! Instagram encontrado!');
        console.log(`🔗 Verificar manualmente: https://instagram.com/${person.instagram.replace('@', '')}`);
      } else {
        console.log('\n⚠️  Instagram não encontrado - verificar logs do servidor para detalhes');
      }
    } else {
      console.log('\n❌ FALHA: Nenhum resultado encontrado');
      console.log('💡 Verifique os logs do servidor para ver o processo de busca');
    }

  } catch (error) {
    console.error('\n❌ ERRO no teste:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUÇÃO: Execute "npm run dev" em outro terminal primeiro');
    } else if (error.response) {
      console.log('📄 Resposta do servidor:', error.response.data);
    }
  }
}

// Executa o teste
testInstagramCompanySearch().catch(console.error);
