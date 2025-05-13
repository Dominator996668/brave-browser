// =================== healthCheck.ts ===================
import { RedisMonitor } from './redisMonitor';
import { DatabaseMonitor } from './databaseMonitor';
import logger from './logger';

// Определяем интерфейс для результата проверки состояния
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'; // Статус проверки всех сервисов
  services: Record<string, 'ok' | 'failed'>; // Статусы отдельных сервисов
}

export class HealthCheck {
  private redisMonitor: RedisMonitor;
  private databaseMonitor: DatabaseMonitor;

  constructor(redisMonitor: RedisMonitor, databaseMonitor: DatabaseMonitor) {
    this.redisMonitor = redisMonitor;
    this.databaseMonitor = databaseMonitor;
  }

  // Проверка состояния Redis
  private async checkRedis(): Promise<boolean> {
    try {
      const client = this.redisMonitor.getClient();
      const response: string = await client.ping(); // Отправляем ping запрос
      return response === 'PONG'; // Проверяем ответ
    } catch (err) {
      logger.error(`Ошибка при проверке Redis: ${err instanceof Error ? err.message : String(err)}`);
      return false; // Возвращаем false в случае ошибки
    }
  }

  // Проверка состояния базы данных - ИСПРАВЛЕННЫЙ КОД
  private async checkDatabase(): Promise<boolean> {
    try {
      const client = this.databaseMonitor.getClient();
      const result = await client.query('SELECT 1'); // Запрос, который выполнится успешно, если соединение активно
      return result !== null && result !== undefined; // Проверяем, что получен какой-то результат
    } catch (err) {
      logger.error(`Ошибка при проверке базы данных: ${err instanceof Error ? err.message : String(err)}`);
      return false; // Возвращаем false в случае ошибки
    }
  }

  // Проверка состояния всех сервисов
  public async checkAllServices(): Promise<HealthCheckResult> {
    const servicesStatus: Record<string, boolean> = {
      redis: await this.checkRedis(), // Проверяем Redis
      database: await this.checkDatabase(), // Проверяем базу данных
    };

    const overallStatus: boolean = Object.values(servicesStatus).every(status => status);

    return {
      status: overallStatus ? 'healthy' : 'unhealthy',
      services: {
        redis: servicesStatus.redis ? 'ok' : 'failed',
        database: servicesStatus.database ? 'ok' : 'failed',
      }
    };
  }
}

// =================== VersionManager.ts ===================
import { config } from '../config';
import { validateInput } from '../config/validator';
import { ProjectRefSchema } from '../types';
import { RedisMonitor } from '../services/redisMonitor';
import logger from '../services/logger';

export class VersionManager {
  private buildConfig: Record<string, string> = {}
  private redisClient: Redis.Redis

  constructor(redisClient: Redis.Redis) {
    this.redisClient = redisClient
    this.buildConfig = {
      chrome: config.chrome,
      'brave-core': config['brave-core']
    }
  }

  // ИСПРАВЛЕННЫЙ КОД
  async getProjectRef(project: string): Promise<string | undefined> {
    try {
      const cached = await this.redisClient.get(project)
      if (cached) return cached

      const version = this.buildConfig[project] || 'not_set'
      if (version !== 'not_set') await this.redisClient.set(project, version, 'EX', 3600)
      return version === 'not_set' ? undefined : version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Ошибка Redis при получении "${project}"`,
        error: errorMessage,
        project
      })
      return this.buildConfig[project] || undefined
    }
  }

  updateBuildConfig(newConfig: Record<string, string>): void {
    try {
      const validated = validateInput(ProjectRefSchema, newConfig)
      Object.assign(this.buildConfig, validated)
    } catch (err) {
      logger.error(`Ошибка валидации конфига: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

// =================== CSS Styles ===================
// Добавленные цветовые переменные (в :root и .dark)
/*
  --warning: 38 92% 50%;
  --warning-foreground: 48 96% 89%;
  --info: 207 90% 54%;
  --info-foreground: 210 40% 98%;
  --success: 142 76% 36%;
  --success-foreground: 144 70% 94%;
  --error: 0 84.2% 60.2%;
  --error-foreground: 0 0% 98%;
*/

// Добавленные стили компонентов
/*
@layer components {
  .material-icons {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
  }

  .code-editor {
    font-family: 'Fira Code', monospace;
  }

  .code-line {
    display: flex;
    position: relative;
    padding: 0;
    margin: 0;
    line-height: 1.5;
  }

  .line-number {
    min-width: 40px;
    padding: 0 8px;
    text-align: right;
    color: hsl(var(--muted-foreground));
    user-select: none;
    border-right: 1px solid hsl(var(--border));
  }

  .code-content {
    flex-grow: 1;
    padding: 0 8px;
    white-space: pre;
    overflow-x: auto;
  }

  .error-line {
    background-color: hsla(var(--destructive), 0.1);
  }

  .highlight {
    background-color: hsla(var(--destructive), 0.3);
    border-radius: 2px;
  }

  .keyword {
    color: hsl(var(--primary));
    font-weight: bold;
  }

  .string {
    color: hsl(var(--success));
  }

  .comment {
    color: hsl(var(--muted-foreground));
    font-style: italic;
  }

  .function {
    color: hsl(var(--warning));
  }

  .tab {
    padding: 1rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
  }

  .tab:hover {
    background-color: hsla(var(--muted), 0.5);
  }

  .tab.active {
    border-bottom: 2px solid hsl(var(--primary));
    color: hsl(var(--primary));
    background-color: hsla(var(--primary), 0.05);
  }
}
*/

// =================== routes.ts ===================
// WebSocket исправная часть
/*
// Broadcast to all clients
function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
*/

// =================== qiskit_bb84.py ===================
// Оригинальный код модуля квантовой криптографии
from qiskit import QuantumCircuit, transpile, Aer, execute
from qiskit.visualization import plot_histogram
import numpy as np
import random

def bb84_protocol(n_bits=8):
    """
    Implement the BB84 quantum key distribution protocol.
    
    Args:
        n_bits (int): Number of bits in the key
        
    Returns:
        dict: Dictionary containing protocol results
    """
    # Alice's random bits
    alice_bits = [random.randint(0, 1) for _ in range(n_bits)]
    
    # Alice's random basis choices (0 for Z basis, 1 for X basis)
    alice_bases = [random.randint(0, 1) for _ in range(n_bits)]
    
    # Bob's random basis choices (0 for Z basis, 1 for X basis)
    bob_bases = [random.randint(0, 1) for _ in range(n_bits)]
    
    # Create a quantum circuit for each bit
    qc_list = []
    for i in range(n_bits):
        qc = QuantumCircuit(1, 1)
        
        # Alice prepares her qubit
        if alice_bits[i] == 1:
            qc.x(0)  # |1⟩ state
        
        # If Alice uses X basis, apply Hadamard
        if alice_bases[i] == 1:
            qc.h(0)
        
        # Bob measures in his chosen basis
        if bob_bases[i] == 1:
            qc.h(0)  # Change to X basis
        
        qc.measure(0, 0)
        qc_list.append(qc)
    
    # Simulate the quantum circuits
    simulator = Aer.get_backend('qasm_simulator')
    result = execute(qc_list, simulator, shots=1).result()
    
    # Get Bob's measurement results
    bob_measurements = []
    for i in range(n_bits):
        counts = result.get_counts(qc_list[i])
        bob_measurements.append(int(list(counts.keys())[0]))
    
    # Determine which bits to keep (where Alice and Bob used the same basis)
    matching_bases = [i for i in range(n_bits) if alice_bases[i] == bob_bases[i]]
    
    # Generate the key from the matching bases
    key = [alice_bits[i] for i in matching_bases]
    
    # Format the key as a string of 0s and 1s
    key_str = ''.join(str(bit) for bit in key)
    
    return {
        "protocol": "BB84",
        "key": key_str,
        "alice_bits": alice_bits,
        "bob_measurements": bob_measurements,
        "matching_bases": matching_bases,
        "matching_bits_count": len(matching_bases)
    }

if __name__ == "__main__":
    # Run the BB84 protocol
    result = bb84_protocol(16)
    
    # Output the results
    print(f"protocol: {result['protocol']}")
    print(f"key: {result['key']}")
    print(f"matching_bits_count: {result['matching_bits_count']}")
