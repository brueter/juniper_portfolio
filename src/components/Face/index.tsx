import { SPEObject } from "@splinetool/runtime";
import { pieceNames } from "../../names.ts";
import BezierEasing from "bezier-easing";
import debugColorized from "../debugColorized/index.tsx";

const ANIMATION_FRAME_DELAY: number = 16;
const TURN_ANGLE: number = Math.PI / 2;
const DURATION: number = 50;

/**
 * functional component for handling data related to each face on a cube
 * handles animating relevant objects, as well as updating pieces array to allow for each face to index proper pieces
 */
export default class Face {
	private keys: string[];
	private indexes: number[] = [];
	private setPieces: Function;
	private setAnimating: Function;

	constructor(keys: string[], setPieces: Function, setAnimating: Function) {
		this.keys = keys;
		this.setPieces = setPieces;
		this.setAnimating = setAnimating;

		const indexes: number[] = [];
		for (const key of keys) {
			const index = Object.keys(pieceNames).indexOf(key);
			if (index !== -1) {
				indexes.push(index);
			}
		}

		this.indexes = indexes;
	}

	/**
	 * @param pieces state containing all pieces
	 * @param faces state containing all faces
	 */
	public animate(
		pieces: Array<SPEObject | undefined>,
		faces: Array<SPEObject | undefined>
	) {
		this.setAnimating(true);
		const initial: number = faces[0]?.rotation.y || 0;
		let currentFrame: number = 0;

		//* mimics css bezier curve math
		const easing: Function = BezierEasing(0.675, -0.155, 0.53, 1.195);

		// handle a single frame of animation
		const doAnimationFrame = (): void => {
			// if the animation isnt finished
			if (currentFrame < DURATION) {
				if (faces[0]) {
					faces[0].rotation.y =
						initial + TURN_ANGLE * easing(currentFrame / DURATION);
					currentFrame++;
					rotateObjects();
					setTimeout(doAnimationFrame, ANIMATION_FRAME_DELAY);
				}
			}
			// animation is done
			else {
				if (faces[0]) {
					faces[0].rotation.y = initial + TURN_ANGLE;
					rotateObjects();
				}
				this.setAnimating(false);
			}
		};

		const rotateObjects = () => {
			if (pieces.every((piece) => piece)) {
				const angle: number = faces[0]?.rotation.y || 0;
				for (let i = 0; i < this.indexes.length; i++) {
					const x: number = pieces[this.indexes[i]]?.position.x || 0;
					const z: number = pieces[this.indexes[i]]?.position.z || 0;
					// get the distance from the piece to the rotating face
					const radius: number = Math.sqrt(x ** 2 + z ** 2);
					// calculate angular offset from the object to the rotating face
					const offset: number =
						Math.atan2(x, z) - (pieces[this.indexes[i]]?.rotation.y || 0);

					// calculate new x and z coordinates using distance and angular offset in relation to rotating face
					const newZ: number = radius * Math.cos(angle + offset);
					const newX: number = radius * Math.sin(angle + offset);
					if (pieces[this.indexes[i]]) {
						(pieces[this.indexes[i]] as SPEObject).position.x = newX;
						(pieces[this.indexes[i]] as SPEObject).position.z = newZ;
						(pieces[this.indexes[i]] as SPEObject).rotation.y = angle;
					}
				}
			}
		};
		// execute a frame
		doAnimationFrame();

		// rearrange pieces in array
		const rotatedPieces: (SPEObject | undefined)[] = pieces.slice();

		for (let i = 0; i < this.keys.length; i++) {
			const newIndex = (i + 2) % this.indexes.length;
			rotatedPieces[this.indexes[i]] = pieces[this.indexes[newIndex]];
		}

		this.setPieces(rotatedPieces);
		debugColorized(pieces);
	}
}
