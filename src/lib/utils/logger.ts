
export function logInfo(message: string): void {
	console.log(message);

}

export function logError(message: string, ...err: Record<string, unknown>[]): void {
	console.error(message, err);
}

export function logWarn(message: string): void {
	console.warn(message);
}

export function logDebug(message: string): void {
	console.debug(message);
}
