import * as httpContext from 'express-http-context';
import { logDebug, logError, logInfo, logWarn } from '../utils/logger';

export abstract class BaseService {
	protected moduleName: string;
	protected txId?: string;
	constructor(moduleName: string) {
		this.moduleName = moduleName;
	}

	protected getTxId(): string {
		return httpContext.get('txId');
	}

	protected logInfo(message: string) {
		logInfo(`[${new Date().toISOString()}] → [TXID]: ${this.getTxId()} → [MODULE]: ${this.moduleName.toUpperCase()} -> ${message}`);
	}
	protected logDebug(message: string) {
		logDebug(`[${new Date().toISOString()}] → [TXID]: ${this.getTxId()} → [MODULE]: ${this.moduleName.toUpperCase()} -> ${message}`);
	}
	protected logError(message: string, ...err: Record<string, unknown>[]) {
		logError(`[${new Date().toISOString()}] → [TXID]: ${this.getTxId()} → [MODULE]: ${this.moduleName.toUpperCase()} -> ${message}`, ...err);
	}
	protected logWarn(message: string) {
		logWarn(`[${new Date().toISOString()}] → [TXID]: ${this.getTxId()} → [MODULE]: ${this.moduleName.toUpperCase()} -> ${message}`);
	}

}
