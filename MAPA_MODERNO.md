# 🎮 Palworld Admin Panel - Design Moderno

Portal web profissional para administração de servidores Palworld com mapa interativo estilo palworld.gg.

## ✨ Novas Funcionalidades

### 🗺️ Mapa Interativo Moderno
- **Design Inspirado em palworld.gg**: Interface escura e profissional
- **Painel Lateral Retrátil**: Filtros e lista de jogadores com toggle
- **Marcadores Animados**: Pulso em tempo real para jogadores online
- **Tooltips Informativos**: Hover sobre marcadores mostra detalhes
- **Busca de Jogadores**: Filtro em tempo real por nome
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### 🎨 Design System
- **Cores Profissionais**:
  - Background Principal: `#0b1d2c`
  - Painel Lateral: `#091825`
  - Mapa: `#102536`
  - Destaque: `#17f0ff` (ciano brilhante)
  - Bordas: `#2e5270`
- **Fonte**: Nunito (Google Fonts)
- **Animações**: Transições suaves e pulsos nos marcadores

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Configuração

Edite `.env.local` com suas credenciais:

```bash
# REST API do Palworld
PALWORLD_API_URL=http://seu-servidor:8212
PALWORLD_API_USERNAME=admin
PALWORLD_API_PASSWORD=sua_senha_segura

# RCON (opcional)
PALWORLD_RCON_HOST=seu-servidor
PALWORLD_RCON_PORT=25575
PALWORLD_RCON_PASSWORD=sua_senha_rcon
```

### Executar

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📋 Funcionalidades

### Interface Principal
1. **Painel Lateral (Esquerda)**
   - Contador de jogadores online
   - Campo de busca
   - Lista de jogadores com avatares
   - Toggle para mostrar/ocultar

2. **Mapa Interativo (Centro)**
   - Mapa completo de Palworld
   - Marcadores animados de jogadores
   - Coordenadas do mouse em tempo real
   - Zoom e pan com Leaflet
   - Popups informativos ao clicar

3. **Recursos Adicionais**
   - Atualização automática a cada 5 segundos
   - Sistema de cores profissional
   - Scrollbar customizado
   - Transições suaves

### Componentes

#### MapModern.tsx
Novo componente de mapa com:
- Leaflet.js para renderização
- Painel lateral integrado
- Sistema de busca
- Marcadores customizados com animação
- Design responsivo

#### Estilos Globais
- Tema escuro consistente
- Scrollbars personalizados
- Estilos Leaflet customizados
- Fonte Nunito

## 🎯 Diferenças do Design Antigo

| Antigo | Novo |
|--------|------|
| Mapa simples com Canvas | Leaflet.js profissional |
| Sem painel lateral | Painel lateral completo |
| Marcadores básicos | Marcadores animados com pulso |
| Sem busca | Sistema de busca integrado |
| Design básico | Design inspirado em palworld.gg |
| Tooltips simples | Tooltips estilizados |

## 🔧 Tecnologias

- **Next.js 14**: Framework React
- **TypeScript**: Type safety
- **Leaflet.js**: Biblioteca de mapas
- **React Leaflet**: Integração React
- **Tailwind CSS**: Utility-first CSS
- **Socket.IO**: WebSocket (futuro)

## 📱 Responsividade

- **Desktop**: Painel lateral + mapa lado a lado
- **Tablet/Mobile**: Painel overlay com toggle
- **< 1100px**: Layout adaptado
- **< 600px**: Interface otimizada

## 🎨 Customização

### Cores
Edite em `globals.css`:
```css
/* Background principal */
background-color: #0b1d2c;

/* Painel lateral */
background-color: #091825;

/* Destaque */
color: #17f0ff;
```

### Marcadores
Personalize em `MapModern.tsx`:
```tsx
.marker-dot {
  background-color: #17f0ff;
  border: 2px solid #fff;
  animation: pulse 2s ease-in-out infinite;
}
```

## 📖 Estrutura de Arquivos

```
app/
├── components/
│   ├── Map.tsx              # Mapa antigo (backup)
│   ├── MapModern.tsx        # Novo mapa moderno ⭐
│   └── SpawnModal.tsx       # Modal de spawn
├── globals.css              # Estilos globais atualizados
├── page.tsx                 # Página principal atualizada
└── layout.tsx               # Layout base
```

## 🐛 Troubleshooting

### Mapa não carrega
1. Verifique se a imagem está em `/public/map/palworld-map.png`
2. Verifique console do navegador
3. Limpe cache: `rm -rf .next && npm run dev`

### Jogadores não aparecem
1. Verifique variáveis de ambiente
2. Teste endpoint: `curl http://localhost:3000/api/players`
3. Veja logs do servidor

### Painel não abre/fecha
1. Verifique console do navegador
2. Teste em modo desktop
3. Limpe cache do navegador

## 🚀 Próximos Passos

- [ ] Adicionar autenticação de usuários
- [ ] Sistema de multi-servidores
- [ ] Dashboard com estatísticas
- [ ] Chat em tempo real
- [ ] Histórico de posições
- [ ] Marcadores personalizados
- [ ] Temas customizáveis

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

**Desenvolvido com ❤️ para a comunidade Palworld**
