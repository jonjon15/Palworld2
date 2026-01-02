#!/bin/bash

# Script para gerenciar o servidor Palworld Admin Panel
# Uso: ./server.sh [start|stop|restart|status]

PID_FILE=".dev.pid"
LOG_FILE="dev.log"

start_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Servidor já está rodando (PID: $(cat $PID_FILE))"
        return 1
    fi

    echo "Iniciando servidor em background..."
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 2

    if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Servidor iniciado com sucesso (PID: $(cat $PID_FILE))"
        echo "Logs: $LOG_FILE"
        echo "Para parar: ./server.sh stop"
    else
        echo "Erro ao iniciar servidor"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_server() {
    if [ ! -f "$PID_FILE" ]; then
        echo "Servidor não está rodando"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Parando servidor (PID: $PID)..."
        kill "$PID"

        # Aguarda até 10 segundos para o processo terminar
        for i in {1..10}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                break
            fi
            sleep 1
        done

        if kill -0 "$PID" 2>/dev/null; then
            echo "Forçando parada..."
            kill -9 "$PID"
        fi
    fi

    rm -f "$PID_FILE"
    echo "Servidor parado"
}

restart_server() {
    echo "Reiniciando servidor..."
    stop_server
    sleep 2
    start_server
}

status_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "✅ Servidor rodando (PID: $(cat $PID_FILE))"
        echo "📝 Logs: $LOG_FILE"
        echo "🌐 Porta: 3000 (ou 3001 se ocupada)"
    else
        echo "❌ Servidor parado"
        if [ -f "$PID_FILE" ]; then
            rm -f "$PID_FILE"
        fi
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "Arquivo de log não encontrado: $LOG_FILE"
        fi
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o servidor em background"
        echo "  stop    - Para o servidor"
        echo "  restart - Reinicia o servidor"
        echo "  status  - Mostra status do servidor"
        echo "  logs    - Mostra logs em tempo real"
        exit 1
        ;;
esac