import { LogsRepository } from '../database/repositories/logs.repo';

export class LoggerService {
  public static info(agentName: string, action: string, details: any = {}): void {
    LogsRepository.log(agentName, 'INFO', action, details);
  }

  public static warn(agentName: string, action: string, details: any = {}): void {
    LogsRepository.log(agentName, 'WARN', action, details);
  }

  public static error(agentName: string, action: string, details: any = {}): void {
    LogsRepository.log(agentName, 'ERROR', action, details);
  }

  public static history(actionType: string, payload: any): void {
    LogsRepository.saveHistory(actionType, payload);
  }
}
