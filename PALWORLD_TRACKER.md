# Palworld Player Tracker — Guia Completo para Copilot

Este documento é a **fonte única de verdade** do projeto.
O GitHub Copilot deve ler este arquivo **por completo** e implementar o sistema exatamente como descrito.

---

## VISÃO GERAL

Objetivo: capturar a **localização real dos jogadores** em servidores Palworld (Windows Dedicated),
armazenar de forma segura e disponibilizar em um **portal web multi-servidor**, em tempo quase real.

Arquitetura:

[Servidor Palworld]
  └── MOD C++ (DLL UE5)
        └── players_positions.json
              └── Agent Local (Go)
                    └── API Central
                          └── Portal Web / WebSocket

REGRAS ABSOLUTAS:
- O MOD NÃO expõe rede
- O servidor Palworld NÃO abre portas
- Toda comunicação externa é feita pelo Agent
- O sistema deve suportar múltiplos servidores
- Código real, compilável, sem pseudocódigo frágil

---

## ETAPA 1 — MOD C++ (UNREAL ENGINE 5)

Responsabilidade:
- Rodar dentro do processo do servidor Palworld
- Ler posição real dos jogadores
- Gerar JSON local
- NÃO implementar HTTP ou sockets

### Estrutura do Projeto

PalworldTracker/
- dllmain.cpp
- Tracker.h
- Tracker.cpp

### Tracker.h
```cpp
#pragma once
void StartTracker();
```

### dllmain.cpp
```cpp
#include <Windows.h>
#include "Tracker.h"

DWORD WINAPI InitThread(LPVOID)
{
    StartTracker();
    return 0;
}

BOOL APIENTRY DllMain(HMODULE hModule,
                      DWORD reason,
                      LPVOID)
{
    if (reason == DLL_PROCESS_ATTACH)
    {
        DisableThreadLibraryCalls(hModule);
        CreateThread(nullptr, 0, InitThread, nullptr, 0, nullptr);
    }
    return TRUE;
}
```

### Tracker.cpp
```cpp
#include "Tracker.h"
#include <fstream>
#include <thread>
#include <chrono>

#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/Character.h"
#include "GameFramework/PlayerState.h"

void StartTracker()
{
    while (true)
    {
        std::this_thread::sleep_for(std::chrono::seconds(5));
        if (!GWorld) continue;

        std::ofstream file("C:/PalServer/monitor/players_positions.json");

        file << "{ \"players\": [";
        bool first = true;

        for (TActorIterator<ACharacter> It(GWorld); It; ++It)
        {
            APlayerState* PS = It->GetPlayerState();
            if (!PS) continue;

            FVector Pos = It->GetActorLocation();

            if (!first) file << ",";
            first = false;

            file << "{"
                 << "\"name\":\"" << TCHAR_TO_UTF8(*PS->GetPlayerName()) << "\","
                 << "\"x\":" << Pos.X << ","
                 << "\"y\":" << Pos.Y << ","
                 << "\"z\":" << Pos.Z
                 << "}";
        }

        file << "] }";
        file.close();
    }
}
```

---

## ETAPA 2 — AGENT LOCAL (GO)

Responsabilidade:
- Ler o JSON local
- Identificar o servidor
- Enviar dados via HTTP seguro
- Executar como serviço Windows

### Estrutura

palworld-agent/
- main.go
- reader.go
- sender.go
- models.go
- config.yaml

### config.yaml
```yaml
server_id: pal-01
server_name: Palworld Brasil #1
json_path: C:/PalServer/monitor/players_positions.json

api:
  endpoint: https://api.seuportal.com/ingest
  token: TOKEN_DO_SERVIDOR

interval_seconds: 5
```

---

## ETAPA 3 — API CENTRAL

Responsabilidade:
- Receber dados de múltiplos servidores
- Validar token
- Cachear estado atual
- Servir dados ao portal
- Preparar WebSocket

Endpoints mínimos:
- POST /ingest
- GET /servers
- GET /servers/{id}/players

---

## ETAPA 4 — PORTAL WEB

Responsabilidade:
- Consumir API
- Exibir mapa
- Suportar múltiplos servidores
- Atualização em tempo real (WebSocket)

---

## EXPECTATIVA DO COPILOT

- Implementar o sistema exatamente nesta ordem
- Criar código organizado por arquivos
- Não pular camadas
- Não inventar APIs inexistentes
- Explicar brevemente cada arquivo gerado

COMECE SEMPRE PELA ETAPA 1.
