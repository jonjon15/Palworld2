#include "Tracker.h"
#include <windows.h>
#include <fstream>
#include <vector>
#include <string>
#include <thread>
#include <chrono>
#include <mutex>
#include <nlohmann/json.hpp>

// Estrutura para armazenar informações do jogador
typedef struct PlayerInfo {
    std::string name;
    uint64_t steamId;
    float x, y, z;
} PlayerInfo;

std::mutex tracker_mutex;

// Função stub: Substitua por integração real com UE5/Palworld
std::vector<PlayerInfo> GetPlayers() {
    // TODO: Integrar com a API interna do Palworld/Unreal Engine 5
    // Exemplo de retorno fake para compilação:
    return {
        {"Player1", 123456789, 100.0f, 200.0f, 300.0f},
        {"Player2", 987654321, 400.0f, 500.0f, 600.0f}
    };
}

void WritePlayersJson(const std::vector<PlayerInfo>& players) {
    nlohmann::json j;
    for (const auto& p : players) {
        j["players"].push_back({
            {"name", p.name},
            {"steamId", std::to_string(p.steamId)},
            {"x", p.x},
            {"y", p.y},
            {"z", p.z}
        });
    }
    std::lock_guard<std::mutex> lock(tracker_mutex);
    std::ofstream out("players_positions.json");
    out << j.dump(2);
}

void TrackerLoop() {
    while (true) {
        auto players = GetPlayers();
        WritePlayersJson(players);
        std::this_thread::sleep_for(std::chrono::seconds(2));
    }
}

void StartTracker() {
    static std::thread trackerThread(TrackerLoop);
    trackerThread.detach();
}
