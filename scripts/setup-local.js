const fs = require('fs');
const path = require('path');

// Criar diretório uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Diretório uploads criado');
} else {
  console.log('✅ Diretório uploads já existe');
}

console.log('🚀 Configuração local concluída!');
console.log('📁 Banco PostgreSQL: postgresql://postgres:postgres@localhost:5432/visalytica_local');
console.log('🐳 Para iniciar o banco: yarn db:start');
console.log('📸 Imagens serão salvas em: ./uploads');
console.log('🌐 Servidor rodará em: http://localhost:3001');