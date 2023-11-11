import { SPEObject } from "@splinetool/runtime";
import { faceNames, pieceNames } from "../../names.ts";
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
	private setPieces: Function;
	private setAnimating: Function;
	private rotationAxis: "x" | "y" | "z";
	private positionAxis: { [key: string]: "x" | "y" | "z" };
	private face: "R" | "O" | "Y" | "G" | "B" | "W";
	private offset: number[] = [];

	constructor(
		keys: string[],
		setPieces: Function,
		setAnimating: Function,
		axis: "x" | "y" | "z",
		face: "R" | "O" | "Y" | "G" | "B" | "W"
	) {
		this.keys = keys;
		this.setPieces = setPieces;
		this.setAnimating = setAnimating;
		this.rotationAxis = axis;
		this.face = face;

		this.positionAxis = (() => {
			switch (axis) {
				case "x":
					return {
						a: "z",
						b: "y",
					};
				case "y":
					return {
						a: "x",
						b: "z",
					};
				case "z":
					return {
						a: "y",
						b: "x",
					};
			}
		})();
	}

	/**
	 * @param pieces state containing all pieces
	 * @param faces state containing all faces
	 */
	public animate(
		pieces: { [key: string]: SPEObject | undefined } = {},
		faces: { [key: string]: SPEObject | undefined } = {}
	) {
		const initial: number =
			faces[faceNames[this.face]]?.rotation[this.rotationAxis] || 0;

		let currentFrame: number = 0;
		console.log(
			(faces[this.face]!.rotation[this.rotationAxis] * 180) / Math.PI
		);

		for (let i = 0; i < this.keys.length; i++) {
			this.offset[i] =
				Math.atan2(
					pieces[this.keys[i]]!.position[this.positionAxis.a],
					pieces[this.keys[i]]!.position[this.positionAxis.b]
				) - faces[this.face]!.rotation[this.rotationAxis];
		}

		//* mimics css bezier curve math
		const easing: Function = BezierEasing(0.675, -0.155, 0.53, 1.195);

		// handle a single frame of animation
		const doAnimationFrame = (): void => {
			// if the animation isnt finished
			if (currentFrame < DURATION) {
				faces[faceNames[this.face]]!.rotation[this.rotationAxis] =
					initial + TURN_ANGLE * easing(currentFrame / DURATION);
				rotateObjects();
				currentFrame++;
				setTimeout(doAnimationFrame, ANIMATION_FRAME_DELAY);
			}
			// animation is done
			else {
				faces[this.face]!.rotation[this.rotationAxis] = initial + TURN_ANGLE;
				rotateObjects();
				this.setAnimating(false);
			}
		};

		const rotateObjects = () => {
			const angle: number = faces[this.face]!.rotation[this.rotationAxis];
			for (let i = 0; i < this.keys.length; i++) {
				const a: number = pieces[this.keys[i]]!.position[this.positionAxis.a];
				const b: number = pieces[this.keys[i]]!.position[this.positionAxis.b];
				// get the distance from the piece to the rotating face
				const radius: number = Math.sqrt(a ** 2 + b ** 2);
				// calculate angular offset from the object to the rotating face

				// calculate new x and z coordinates using distance and angular offset in relation to rotating face
				const newA: number = radius * Math.sin(angle + this.offset[i]);
				const newB: number = radius * Math.cos(angle + this.offset[i]);
				pieces[this.keys[i]]!.position[this.positionAxis.a] = newA;
				pieces[this.keys[i]]!.position[this.positionAxis.b] = newB;
				pieces[this.keys[i]]!.rotation[this.rotationAxis] = angle;
			}
		};
		// execute a frame
		doAnimationFrame();

		// rearrange pieces in array
		const rotatedPieces = { ...pieces } || {};

		for (let i = 0; i < this.keys.length; i++) {
			rotatedPieces[this.keys[i]] =
				pieces[this.keys[(i + 2) % this.keys.length]];
		}

		debugColorized(rotatedPieces);
		this.setPieces(rotatedPieces);
	}
}
