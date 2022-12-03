export class Mutex {
	#lockPromise;
	#lockPromiseResolve;
	constructor() {
		this.#lockPromise = undefined;
		this.#lockPromiseResolve = undefined;
	}

	async acquire() {
		do {
			await this.#lockPromise;
		} while (this.#lockPromise !== undefined)

		this.#lockPromise = new Promise((resolve) => {
			this.#lockPromiseResolve = resolve;
		});
	}

	release() {
		this.#lockPromise = undefined;
		this.#lockPromiseResolve(true);
	}
}
