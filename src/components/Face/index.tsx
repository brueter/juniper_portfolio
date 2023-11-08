import { SPEObject } from "@splinetool/runtime";

export default class Face {
	public pieces: Array<SPEObject | undefined>;
	private keys: string[];
	private setPieces: Function;
	public indexes: number[] = [];

	constructor(
		pieces: Array<SPEObject | undefined>,
		pieceNames: { [key: string]: string },
		keys: string[],
		setPieces: Function
	) {
		this.pieces = pieces;
		this.keys = keys;
		this.setPieces = setPieces;

		const indexes: number[] = [];
		for (const key of keys) {
			const index = Object.keys(pieceNames).indexOf(key);
			if (index !== -1) {
				indexes.push(index);
			}
		}

		this.indexes = indexes;
	}

	public rotate(): void {
		if (!this.pieces || !this.keys || !this.setPieces) {
			console.error("Invalid parameters.");
			return;
		}

		const rotatedPieces: (SPEObject | undefined)[] = this.pieces.slice();

		for (let i = 0; i < this.keys.length; i++) {
			const newIndex = (i + 2) % this.indexes.length;
			rotatedPieces[this.indexes[i]] = this.pieces[this.indexes[newIndex]];
		}

		this.setPieces(rotatedPieces);
	}
}
