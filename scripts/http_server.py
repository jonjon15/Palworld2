#!/usr/bin/env python3
"""
Servidor HTTP para servir posições dos jogadores do Palworld
Usa o arquivo JSON gerado pelo Extract-PlayerPositions.ps1
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from datetime import datetime

# Configurações
PLAYERS_FILE = os.getenv('PLAYERS_FILE', 'C:\\palworld-data\\players.json')
PORT = int(os.getenv('HTTP_PORT', '8888'))

class PlayerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/players' or self.path == '/api/players/':
            self.serve_players()
        elif self.path == '/health' or self.path == '/':
            self.serve_health()
        else:
            self.send_error(404, "Endpoint não encontrado")
    
    def serve_players(self):
        """Retorna lista de jogadores com posições"""
        try:
            if not os.path.exists(PLAYERS_FILE):
                self.send_json({
                    'success': False,
                    'error': 'Arquivo de jogadores não encontrado',
                    'data': {'players': [], 'count': 0}
                }, 404)
                return
            
            # Ler arquivo
            with open(PLAYERS_FILE, 'r', encoding='utf-8') as f:
                players = json.load(f)
            
            # Informações do arquivo
            file_stat = os.stat(PLAYERS_FILE)
            last_modified = datetime.fromtimestamp(file_stat.st_mtime)
            
            # Resposta
            response = {
                'success': True,
                'data': {
                    'players': players,
                    'count': len(players),
                    'source': 'file',
                    'lastUpdate': last_modified.isoformat()
                }
            }
            
            self.send_json(response)
            print(f'[{datetime.now().strftime("%H:%M:%S")}] ✅ Enviados {len(players)} jogadores')
            
        except json.JSONDecodeError as e:
            self.send_json({
                'success': False,
                'error': f'Erro ao ler JSON: {str(e)}',
                'data': {'players': [], 'count': 0}
            }, 500)
            print(f'[ERRO] JSON inválido: {e}')
        except Exception as e:
            self.send_json({
                'success': False,
                'error': str(e),
                'data': {'players': [], 'count': 0}
            }, 500)
            print(f'[ERRO] {e}')
    
    def serve_health(self):
        """Health check endpoint"""
        file_exists = os.path.exists(PLAYERS_FILE)
        
        if file_exists:
            file_stat = os.stat(PLAYERS_FILE)
            last_modified = datetime.fromtimestamp(file_stat.st_mtime)
            age_seconds = (datetime.now() - last_modified).total_seconds()
            
            with open(PLAYERS_FILE, 'r', encoding='utf-8') as f:
                players = json.load(f)
            
            status = {
                'status': 'healthy' if age_seconds < 60 else 'stale',
                'file': PLAYERS_FILE,
                'exists': True,
                'lastModified': last_modified.isoformat(),
                'ageSeconds': int(age_seconds),
                'playerCount': len(players)
            }
        else:
            status = {
                'status': 'unhealthy',
                'file': PLAYERS_FILE,
                'exists': False,
                'error': 'Arquivo não encontrado'
            }
        
        self.send_json(status)
    
    def send_json(self, data, status_code=200):
        """Envia resposta JSON"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Silenciar logs automáticos"""
        pass

def main():
    print("=" * 50)
    print("  Palworld Position Server")
    print("=" * 50)
    print()
    print(f"📂 Arquivo: {PLAYERS_FILE}")
    print(f"🌐 Porta: {PORT}")
    print()
    
    # Verificar se arquivo existe
    if os.path.exists(PLAYERS_FILE):
        with open(PLAYERS_FILE, 'r', encoding='utf-8') as f:
            players = json.load(f)
        print(f"✅ Arquivo encontrado com {len(players)} jogadores")
    else:
        print(f"⚠️  Arquivo ainda não existe, será criado pelo extrator")
    
    print()
    print(f"🚀 Servidor HTTP iniciado!")
    print(f"📡 Endpoints:")
    print(f"   • http://0.0.0.0:{PORT}/api/players")
    print(f"   • http://0.0.0.0:{PORT}/health")
    print()
    print(f"💡 Acesse de outro computador:")
    print(f"   • http://192.168.15.8:{PORT}/api/players")
    print()
    print("Pressione Ctrl+C para parar")
    print("=" * 50)
    print()
    
    try:
        server = HTTPServer(('0.0.0.0', PORT), PlayerHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor parado pelo usuário")
        server.shutdown()
    except Exception as e:
        print(f"\n\n❌ Erro: {e}")

if __name__ == '__main__':
    main()
