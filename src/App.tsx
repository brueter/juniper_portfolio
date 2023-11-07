import "./App.css";
import { useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";
import { Application, SPEObject } from "@splinetool/runtime";
import BezierEasing from "bezier-easing";
import Face from "./components/Face";
import debugColorized from "./components/debugColorized";

const TURN: number = Math.PI / 2;
const ANIMATION_FRAME_DELAY: number = 16;
const DURATION: number = 50;

let white: Face;

const faceNames: { [key: string]: string } = {
	W: "W",
	R: "R",
	B: "B",
	Y: "Y",
	O: "O",
	G: "G",
};

//* refer to cube layout
const pieceNames: { [key: string]: string } = {
	OGW: "OGW",
	OW: "OW",
	OBW: "OBW",
	BW: "BW",
	RBW: "RBW",
	RW: "RW",
	RGW: "RGW",
	GW: "GW",
	OG: "OG",
	OB: "OB",
	RB: "RB",
	RG: "RG",
	OYG: "OYG",
	OY: "OY",
	OYB: "OYB",
	YB: "YB",
	RYB: "RYB",
	RY: "RY",
	RYG: "RYG",
	YG: "YG",
};

/** cube layout
 * * corresponds to positions in array, (faces) dont need to move and are only here for clarity
 *
 *            (O)
 *
 *        0    1     2
 *
 * (G)    7   (W)    3    (B)
 *
 *        6    5     4
 *
 *            (R)
 *
 * -----------------
 *
 *        8   (O)    9
 *
 *       (G)        (B)
 *
 *       10   (R)   11
 *
 * -----------------
 *
 *            (O)
 *
 *       12   13    14
 *
 * (G)   19   (Y)   15   (B)
 *
 *       18   17    16
 *
 *            (R)
 *
 */

export default function App(): JSX.Element {
	const [faces, setFaces] = useState<Array<SPEObject | undefined>>(Array(6));
	const [pieces, setPieces] = useState<Array<SPEObject | undefined>>(Array(20));
	const [animating, setAnimating] = useState<boolean>(false);

	/**
	 * object names all end with f, gets added here for brevity
	 * @param spline spline scene
	 * @param name name of object
	 * @returns spline object
	 */
	function get(spline: Application, name: string): SPEObject | undefined {
		return spline.findObjectByName(name + "f");
	}

	let first = true;

	//! ONLY DIRECTLY READ PIECES AND FACES WITHIN THIS FUNCTION
	useEffect(() => {
		if (pieces.some((obj) => obj) && faces.some((obj) => obj)) {
			if (first) {
				init();
				first = false;
			}

			debugColorized(pieces);
		}
	}, [pieces, faces]);

	function init(): void {
		white = new Face(
			pieces,
			pieceNames,
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces
		);
	}

	/**
	 * spline scene is finished loading
	 * @param spline spline scene
	 */
	function onLoad(spline: Application): void {
		const loadedFaces: Array<SPEObject | undefined> = [];
		for (const key in faceNames) {
			loadedFaces.push(get(spline, faceNames[key]));
		}
		setFaces(loadedFaces);

		const loadedPieces: Array<SPEObject | undefined> = [];
		for (const key in pieceNames) {
			loadedPieces.push(get(spline, pieceNames[key]));
		}
		setPieces(loadedPieces);
	}

	/**
	 * rotate all pieces around the top white face
	 * @param angle amount to rotate in radians
	 * @param frames length of animation in frames
	 */
	function rotateAnimation(angle: number, frames: number): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			setAnimating(true);
			const initial: number = faces[0]?.rotation.y || 0;
			let currentFrame: number = 0;

			//* mimics css bezier curve math
			const easing: Function = BezierEasing(0.675, -0.155, 0.53, 1.195);

			// handle a single frame of animation
			function rotateFrame(): void {
				// if the animation isnt finished
				if (currentFrame < frames) {
					if (faces[0]) {
						faces[0].rotation.y =
							initial + angle * easing(currentFrame / frames);
						currentFrame++;
						updateRPosition();
						setTimeout(rotateFrame, ANIMATION_FRAME_DELAY);
					}
				} else {
					if (faces[0]) {
						faces[0].rotation.y = initial + angle;
						updateRPosition();
					}
					setAnimating(false);
				}
			}
			// execute a frame
			rotateFrame();
			white.rotate();
		}
	}

	/**
	 * update piece position and rotation based on the position of the top white face
	 * TODO: allow passing axis of rotation
	 * TODO: allow passing direction of rotation
	 */
	function updateRPosition(): void {
		if (pieces.every((piece) => piece)) {
			const angle: number = faces[0]?.rotation.y || 0;
			for (let i = 0; i < white.indexes.length; i++) {
				const x: number = pieces[white.indexes[i]]?.position.x || 0;
				const z: number = pieces[white.indexes[i]]?.position.z || 0;
				// get the distance from the piece to the rotating face
				const radius: number = Math.sqrt(x ** 2 + z ** 2);
				// calculate angular offset from the object to the rotating face
				const offset: number =
					Math.atan2(x, z) - (pieces[white.indexes[i]]?.rotation.y || 0);

				// calculate new x and z coordinates using distance and angular offset in relation to rotating face
				const newZ: number = radius * Math.cos(angle + offset);
				const newX: number = radius * Math.sin(angle + offset);
				if (pieces[white.indexes[i]]) {
					(pieces[white.indexes[i]] as SPEObject).position.x = newX;
					(pieces[white.indexes[i]] as SPEObject).position.z = newZ;
					(pieces[white.indexes[i]] as SPEObject).rotation.y = angle;
				}
			}
		}
	}

	return (
		<div className="App">
			<div className="canvas">
				<Spline
					scene="https://prod.spline.design/617bUredGdLyNfS6/scene.splinecode"
					onLoad={onLoad}
				/>
			</div>

			<button type="button" onClick={() => rotateAnimation(TURN, DURATION)}>
				Move Cube
			</button>
		</div>
	);
}
