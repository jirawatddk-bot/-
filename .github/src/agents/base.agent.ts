import { LoggerService } from '../services/logger.service';

export abstract class BaseAgent<TInput, TOutput> {
  public readonly name: string;
  public readonly role: string;

  constructor(name: string, role: string) {
    this.name = name;
    this.role = role;
  }

  public abstract execute(input: TInput): Promise<TOutput>;

  protected logInfo(action: string, details: any = {}): void {
    LoggerService.info(this.name, action, details);
  }

  protected logWarn(action: string, details: any = {}): void {
    LoggerService.warn(this.name, action, details);
  }

  protected logError(action: string, details: any = {}): void {
    LoggerService.error(this.name, action, details);
  }
}
