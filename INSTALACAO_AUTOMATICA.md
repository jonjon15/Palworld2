# 🚀 INSTALAÇÃO AUTOMÁTICA - 1 COMANDO APENAS!

## 💡 O Jeito Mais Fácil

Execute este comando **como Administrador** no PowerShell:

```powershell
irm https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1 | iex
```

**Pronto!** O script faz TUDO sozinho! ✨

---

## 📋 O Que o Script Faz Automaticamente

✅ **Detecta** o servidor Palworld (procura em todos os locais comuns)  
✅ **Verifica** se Python está instalado (se não, abre a página de download)  
✅ **Cria** todas as pastas necessárias  
✅ **Gera** todos os scripts de extração  
✅ **Configura** o servidor HTTP  
✅ **Cria** atalho na área de trabalho  
✅ **Configura** regras de firewall  
✅ **Testa** se está funcionando  
✅ **Inicia** o tracker automaticamente  

---

## 🎯 Passo a Passo Detalhado

### 1. Abrir PowerShell como Administrador

**Windows 10/11:**
1. Aperte `Win + X`
2. Clique em **"Windows PowerShell (Administrador)"** ou **"Terminal (Administrador)"**
3. Clique **"Sim"** na janela de confirmação

### 2. Executar o Instalador

Cole este comando e aperte Enter:

```powershell
irm https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1 | iex
```

> **Nota**: `irm` = `Invoke-RestMethod` (baixa o script)  
> **Nota**: `iex` = `Invoke-Expression` (executa o script)

### 3. Acompanhar a Instalação

Você verá:

```
================================================
   INSTALADOR AUTOMÁTICO - PALWORLD TRACKER    
================================================

[1/7] Detectando servidor Palworld...
   ✓ Servidor encontrado: D:\SteamLibrary\steamapps\common\PalServer

[2/7] Verificando Python...
   ✓ Python 3.13.11 instalado

[3/7] Criando estrutura de pastas...
   ✓ Pasta de dados: C:\palworld-data
   ✓ Pasta de scripts: D:\...\palworld-tracker

[4/7] Criando scripts necessários...
   ✓ Extrator criado
   ✓ Servidor HTTP criado
   ✓ Inicializador criado

[5/7] Criando atalhos...
   ✓ Atalho criado na área de trabalho

[6/7] Configurando firewall...
   ✓ Firewall configurado (porta 8888)

[7/7] Executando teste inicial...
   ✓ Teste OK! 3 jogador(es) encontrado(s)

================================================
           INSTALAÇÃO CONCLUÍDA! ✓             
================================================
```

### 4. Iniciar o Tracker

O instalador pergunta:

```
Deseja iniciar o tracker agora? (S/N)
```

Digite **S** e aperte Enter!

---

## 🎮 Usando o Tracker

### Opção 1: Atalho da Área de Trabalho

Duplo-clique no atalho **"Palworld Tracker"** criado na sua área de trabalho!

### Opção 2: Manual

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer\palworld-tracker
.\START-TRACKER.bat
```

### Verificar se Está Funcionando

Abra o navegador e acesse:

```
http://localhost:8888/api/players
```

Deve mostrar um JSON com os jogadores! 🎉

---

## ⚙️ Configurações Personalizadas

Se quiser mudar porta ou intervalo de atualização:

```powershell
# Baixar o script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1" -OutFile "$env:TEMP\install.ps1"

# Executar com parâmetros
powershell -ExecutionPolicy Bypass -File "$env:TEMP\install.ps1" -HttpPort 9999 -UpdateInterval 5
```

**Parâmetros disponíveis:**
- `-ServerPath` - Caminho do servidor (detecta automaticamente)
- `-HttpPort` - Porta do servidor HTTP (padrão: 8888)
- `-UpdateInterval` - Intervalo de atualização em segundos (padrão: 10)

---

## 🔧 Solução de Problemas

### "Python não encontrado"

O script abre automaticamente a página de download. Após instalar:
1. **Marque** "Add Python to PATH"
2. Clique "Install Now"
3. Execute o instalador novamente

### "Servidor Palworld não encontrado"

O script perguntará o caminho. Digite algo como:

```
D:\SteamLibrary\steamapps\common\PalServer
```

### "Nenhum jogador encontrado"

Isso é **normal** se:
- Servidor nunca foi iniciado
- Ninguém entrou ainda
- Servidor está limpo

**Solução**: Inicie o servidor Palworld e entre no jogo pelo menos uma vez!

### Porta 8888 já está em uso

Execute com outra porta:

```powershell
irm https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1 | iex -HttpPort 9999
```

---

## 📡 Integrar com o Portal Web (Linux)

Depois que o tracker estiver rodando no Windows, configure o portal:

```bash
# No Linux (codespace)
cd /workspaces/Palworld2

# Adicionar ao .env.local
echo "PALWORLD_POSITIONS_URL=http://192.168.15.8:8888/api/players" >> .env.local

# Reiniciar portal
npm run dev
```

> **Importante**: Troque `192.168.15.8` pelo IP real do seu PC Windows!

### Descobrir seu IP:

No Windows, execute:

```powershell
ipconfig | Select-String "IPv4"
```

---

## 🔄 Iniciar Automaticamente com Windows

O tracker já cria o atalho, mas se quiser que inicie junto com o Windows:

1. Aperte `Win + R`
2. Digite: `shell:startup`
3. Copie o atalho **"Palworld Tracker"** para esta pasta
4. Pronto! Vai iniciar toda vez que ligar o PC

---

## 🛑 Para Parar o Tracker

Se iniciou pelo `.bat`:
- Aperte qualquer tecla na janela do tracker

Ou force o fechamento:

```powershell
taskkill /F /IM python.exe
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Palworld*"
```

---

## 📊 Arquivos Criados

Após a instalação, você terá:

```
D:\SteamLibrary\steamapps\common\PalServer\
└── palworld-tracker\
    ├── Extract-PlayerPositions.ps1    (Extrator)
    ├── http_server.py                  (Servidor HTTP)
    └── START-TRACKER.bat               (Inicializador)

C:\palworld-data\
└── players.json                        (Dados dos jogadores)

Desktop\
└── Palworld Tracker.lnk                (Atalho)
```

---

## 🎯 Resumo Ultra Rápido

```powershell
# 1. Abrir PowerShell como Administrador
Win + X > PowerShell (Admin)

# 2. Executar instalador
irm https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-AUTOMATICO.ps1 | iex

# 3. Apertar S quando perguntar se quer iniciar

# 4. Pronto! 🎉
```

---

## 💬 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique os logs na tela do instalador
2. Certifique-se que o PowerShell está como **Administrador**
3. Verifique se o Python está instalado: `python --version`
4. Verifique se o servidor Palworld existe no caminho detectado

---

**Criado em**: 02/01/2026  
**Versão**: 1.0  
**Compatível com**: Palworld v0.7+ / Windows 10/11
