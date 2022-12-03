export function setTimeoutPromise(delay) {
	return new Promise(resolve => setTimeout(resolve, delay));
}

// You should probably only use that for node apps
export function setImmediatePromise() {
	return new Promise(resolve => setImmediate(resolve));
}
