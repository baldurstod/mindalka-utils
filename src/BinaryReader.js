export const TWO_POW_10 = 1024;
export const TWO_POW_MINUS_14 = Math.pow(2, -14);

export function getCharCodes(string) {
	let codes = new Uint8Array(string.length);

	for (var i = 0, length = string.length; i < length; i++) {
		codes[i] = string.charCodeAt(i) & 0xff;
	}
	return codes;
}

export class BinaryReader {
	constructor(buffer, byteOffset, byteLength, littleEndian = true) {
		this.byteOffset = 0;
		this.littleEndian = littleEndian;
		this.#initDataview(buffer, byteOffset, byteLength);
	}

	#initDataview(buffer, byteOffset, byteLength) {
		if (buffer instanceof BinaryReader) {
			this._dataView = new DataView(buffer.buffer, byteOffset ? byteOffset + buffer._dataView.byteOffset : buffer._dataView.byteOffset, byteLength);
		} else if (buffer instanceof Uint8Array) {
			this._dataView = new DataView(buffer.buffer, byteOffset ? byteOffset + buffer.byteOffset : buffer.byteOffset, byteLength);
		} else if (buffer instanceof ArrayBuffer) {
			this._dataView = new DataView(buffer, byteOffset, byteLength);
		} else if (typeof buffer === 'string') {
			this._dataView = new DataView(getCharCodes(buffer).buffer, byteOffset, byteLength);
		} else if (typeof buffer === 'number') {
			this._dataView = new DataView(new Uint8Array(buffer).buffer, byteOffset, byteLength);
		} else {
			console.error(`Unknow buffer type : ${buffer}`);
		}
	}

	get buffer() {
		return this._dataView.buffer;
	}

	get byteLength() {
		return this._dataView.byteLength;
	}

	tell() {
		return this.byteOffset;
	}

	seek(byteOffset = this.byteOffset) {
		// /_checkBounds
		this.byteOffset = byteOffset;
	}

	skip(byteLength = 0) {
		// /_checkBounds
		this.byteOffset += byteLength;
	}

	getString(byteLength, byteOffset = this.byteOffset) {
		let string = '';
		let readBuffer = new Uint8Array(this.buffer, byteOffset + this._dataView.byteOffset, byteLength);
			// /_checkBounds
		this.byteOffset = byteOffset + byteLength;
		for (var i = 0; i < byteLength; i++) {
			string += String.fromCharCode(readBuffer[i]);
		}
		return string;
	}

	getNullString(byteOffset = this.byteOffset) {
		let string = '';
		let readBuffer = new Uint8Array(this.buffer, this._dataView.byteOffset);

		this.byteOffset = byteOffset;
		let c;
		do {
			c = String.fromCharCode(readBuffer[this.byteOffset++]);
			if (c == '\0') {
			} else {
				string += c;
			}
		} while(c != '\0');
		return string;
	}

	setString(string, byteOffset = this.byteOffset) {
		let length = string.length;
		this.byteOffset = byteOffset + length;
		let writeBuffer = new Uint8Array(this.buffer, byteOffset + this._dataView.byteOffset, length);
		//TODO: check len

		for (var i = 0, l = length; i < l; i++) {
			writeBuffer[i] = string.charCodeAt(i) & 0xff;
		}
	}

	getBytes(byteLength, byteOffset = this.byteOffset) {
		let readBuffer = new Uint8Array(this.buffer, byteOffset + this._dataView.byteOffset, byteLength);
		this.byteOffset = byteOffset + byteLength;
		return readBuffer;
	}

	getInt8(byteOffset = this.byteOffset) {
		this.byteOffset = byteOffset + 1;
		return this._dataView.getInt8(byteOffset);
	}

	getUint8(byteOffset = this.byteOffset) {
		this.byteOffset = byteOffset + 1;
		return this._dataView.getUint8(byteOffset);
	}

	getInt16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		return this._dataView.getInt16(byteOffset, littleEndian);
	}

	getUint16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		return this._dataView.getUint16(byteOffset, littleEndian);
	}

	getFloat16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {//TODOv3: optimize this function
		//TODO: fix endianness
		this.byteOffset = byteOffset + 2;

		let readBuffer = new Uint8Array(this.buffer, byteOffset + this._dataView.byteOffset, 2);//TODOv3: optimize
		let b = readBuffer;//this._getBytes(2, byteOffset, littleEndian);

		let sign = b[1] >> 7;
		let exponent = ((b[1] & 0x7C) >> 2);
		let mantissa = ((b[1] & 0x03) << 8) | b[0];

		if(exponent == 0) {
			return (sign ? -1 : 1) * TWO_POW_MINUS_14 * (mantissa / TWO_POW_10);
		} else if (exponent == 0x1F) {
			return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
		}

		return (sign?-1:1) * Math.pow(2, exponent-15) * (1+(mantissa/TWO_POW_10));
	}

	getInt32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.getInt32(byteOffset, littleEndian);
	}

	getUint32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.getUint32(byteOffset, littleEndian);
	}

	getFloat32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.getFloat32(byteOffset, littleEndian);
	}

	getBigInt64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.getBigInt64(byteOffset, littleEndian);
	}

	getBigUint64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.getBigUint64(byteOffset, littleEndian);
	}

	getFloat64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.getFloat64(byteOffset, littleEndian);
	}

	getVector2(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(2);
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector3(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(3);
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector4(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(4);
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		vec[3] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	getVector48(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(3);
		vec[0] = this.getFloat16(byteOffset, littleEndian);
		vec[1] = this.getFloat16(undefined, littleEndian);
		vec[2] = this.getFloat16(undefined, littleEndian);
		return vec;
	}

	getQuaternion(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(4);
		vec[0] = this.getFloat32(byteOffset, littleEndian);
		vec[1] = this.getFloat32(undefined, littleEndian);
		vec[2] = this.getFloat32(undefined, littleEndian);
		vec[3] = this.getFloat32(undefined, littleEndian);
		return vec;
	}

	setBigInt64(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.setBigInt64(byteOffset, value, littleEndian);
	}

	setBigUint64(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.setBigUint64(byteOffset, value, littleEndian);
	}

	setFloat32(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.setFloat32(byteOffset, value, littleEndian);
	}

	setFloat64(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		return this._dataView.setFloat64(byteOffset, value, littleEndian);
	}

	setInt8(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset +1;
		return this._dataView.setInt8(byteOffset, value, littleEndian);
	}

	setInt16(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		return this._dataView.setInt16(byteOffset, value, littleEndian);
	}

	setInt32(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.setInt32(byteOffset, value, littleEndian);
	}

	setUint8(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset +1;
		return this._dataView.setUint8(byteOffset, value, littleEndian);
	}

	setUint16(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		return this._dataView.setUint16(byteOffset, value, littleEndian);
	}

	setUint32(value, byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		return this._dataView.setUint32(byteOffset, value, littleEndian);
	}

	setBytes(bytes, byteOffset = this.byteOffset) {
		let length = bytes.length;
		this.byteOffset = byteOffset + length;
		new Uint8Array(this._dataView.buffer, byteOffset + this._dataView.byteOffset, length).set(bytes);
	}
/*
	_setBytes(byteOffset = this.byteOffset, bytes) {
		let length = bytes.length;

		//this._checkBounds(byteOffset, length);

		byteOffset += this.byteOffset;

		if (this._isArrayBuffer) {
			new Uint8Array(this.buffer, byteOffset, length).set(bytes);
		}
		else {
			if (this._isNodeBuffer) {
				// workaround for Node.js v0.11.6 (`new Buffer(bufferInstance)` call corrupts original data)
				(bytes instanceof Buffer ? bytes : new Buffer(bytes)).copy(this.buffer, byteOffset);
			} else {
				for (var i = 0; i < length; i++) {
					this.buffer[byteOffset + i] = bytes[i];
				}
			}
		}

		this._offset = byteOffset - this.byteOffset + length;
	}*/
}
