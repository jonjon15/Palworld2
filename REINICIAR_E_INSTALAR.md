# 🔄 Reiniciar Sistema e Instalação em Outro PC

## 🔄 DEPOIS DE REINICIAR O PC

### Opção 1: Usar o Atalho (Mais Fácil) ⭐

Simplesmente **duplo-clique** no atalho **"Palworld Tracker"** na área de trabalho!

Pronto! Tudo volta a funcionar.

---

### Opção 2: Linha de Comando

Se o atalho não funcionar, no PowerShell:

```powershell
cd D:\SteamLibrary\steamapps\common\PalServer\palworld-tracker
.\START-TRACKER.bat
```

---

### Opção 3: Iniciar Automaticamente com Windows

Para que inicie SOZINHO quando ligar o PC:

1. Aperte `Win + R`
2. Digite: `shell:startup`
3. Copie o atalho **"Palworld Tracker"** para esta pasta
4. **Pronto!** Vai iniciar automaticamente toda vez que ligar o Windows

---

## 💻 INSTALAR EM OUTRO PC

### Método 1: Instalação Automática (Recomendado) ⭐

No **PowerShell como Administrador** do novo PC:

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-SIMPLES.ps1" -OutFile "$env:TEMP\install.ps1"; powershell -ExecutionPolicy Bypass -File "$env:TEMP\install.ps1"
```

**Pronto!** Faz tudo automaticamente:
- Detecta o servidor Palworld
- Instala os scripts
- Configura firewall
- Cria atalho
- Testa funcionamento

---

### Método 2: Instalação Manual

Se preferir fazer manualmente:

#### 1. Instalar Python

- Baixe: https://python.org/downloads/
- ☑️ Marque "Add Python to PATH"
- Clique "Install Now"

#### 2. Baixar Scripts

No PowerShell:

```powershell
# Definir caminho do servidor Palworld
$ServerPath = "D:\SteamLibrary\steamapps\common\PalServer"  # AJUSTE SE NECESSÁRIO
$ScriptsPath = "$ServerPath\palworld-tracker"

# Criar pastas
New-Item -Path "C:\palworld-data" -ItemType Directory -Force
New-Item -Path $ScriptsPath -ItemType Directory -Force

# Baixar scripts
$baseUrl = "https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts"
Invoke-WebRequest -Uri "$baseUrl/Extract-PlayerPositions.ps1" -OutFile "$ScriptsPath\Extract-PlayerPositions.ps1"

# O resto dos scripts será criado pelo instalador automático
```

#### 3. Executar Instalador

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jonjon15/Palworld2/main/scripts/INSTALL-SIMPLES.ps1" -OutFile "$env:TEMP\install.ps1"
powershell -ExecutionPolicy Bypass -File "$env:TEMP\install.ps1"
```

---

## 📁 COPIAR INSTALAÇÃO EXISTENTE PARA OUTRO PC

Se quiser copiar a instalação atual para outro PC:

### No PC Atual (que já tem instalado):

1. Copiar pasta:
   ```
   D:\SteamLibrary\steamapps\common\PalServer\palworld-tracker
   ```

2. Copiar para pen-drive ou rede

### No PC Novo:

1. Colar em:
   ```
   D:\SteamLibrary\steamapps\common\PalServer\palworld-tracker
   ```
   (Ou onde estiver o servidor Palworld)

2. Editar `START-TRACKER.bat` e ajustar caminhos se necessário

3. Criar atalho manualmente:
   - Botão direito → Novo → Atalho
   - Apontar para `START-TRACKER.bat`

4. Configurar firewall:
   ```powershell
   New-NetFirewallRule -DisplayName "Palworld Tracker HTTP" -Direction Inbound -Protocol TCP -LocalPort 8888 -Action Allow
   ```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Após reiniciar ou instalar:

1. **Abrir navegador**
2. **Acessar**: http://localhost:8888/api/players
3. **Deve mostrar JSON** com jogadores

Ou no PowerShell:

```powershell
curl http://localhost:8888/api/players
```

---

## 🛑 PARAR O TRACKER

### Método 1: Pela Janela

Se iniciou pelo `.bat`, aperte qualquer tecla na janela.

### Método 2: PowerShell

```powershell
taskkill /F /IM python.exe
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq Palworld*"
```

---

## 🔧 PROBLEMAS COMUNS

### "Não encontra o servidor Palworld"

Edite o script `START-TRACKER.bat` e ajuste o caminho:

```batch
# Linha que tem o caminho do servidor
start /MIN "Extractor" powershell -WindowStyle Hidden -Command "while($true) { & 'SEU_CAMINHO_AQUI\palworld-tracker\Extract-PlayerPositions.ps1' ...
```

### "Porta 8888 já está em uso"

Alguém já está usando a porta 8888. Para mudar:

1. Edite `http_server.py`
2. Mude `8888` para outra porta (ex: `9999`)
3. Atualize no `START-TRACKER.bat` também

### "Python não encontrado"

Reinstale Python:
- https://python.org/downloads/
- ☑️ Marque "Add Python to PATH"

---

## 📋 RESUMO RÁPIDO

### Reiniciou o PC?
→ Duplo-clique no atalho "Palworld Tracker"

### PC novo?
→ Execute o instalador automático (1 comando)

### Quer iniciar automaticamente?
→ Copie atalho para `shell:startup`

### Quer copiar instalação?
→ Copie pasta `palworld-tracker` inteira

---

## 🎯 COMANDOS ÚTEIS

### Verificar se está rodando:

```powershell
# Ver processos Python
Get-Process python -ErrorAction SilentlyContinue

# Ver porta 8888
Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue

# Testar API
curl http://localhost:8888/api/players
```

### Reiniciar o tracker:

```powershell
# Parar
taskkill /F /IM python.exe

# Iniciar
cd D:\SteamLibrary\steamapps\common\PalServer\palworld-tracker
.\START-TRACKER.bat
```

---

**Atualizado**: 02/01/2026  
**Versão**: 1.0
