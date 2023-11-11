import "./App.css";
import { useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";
import { Application, SPEObject } from "@splinetool/runtime";
import Face from "./components/Face";
import debugColorized from "./components/debugColorized";
import { faceNames, pieceNames } from "./names.ts";

let red: Face;
let orange: Face;
let yellow: Face;
let green: Face;
let blue: Face;
let white: Face;

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
	const [faces, setFaces] = useState<{ [key: string]: SPEObject | undefined }>(
		{}
	);
	const [pieces, setPieces] = useState<{
		[key: string]: SPEObject | undefined;
	}>({});
	const [animating, setAnimating] = useState<boolean>(false);
	const [first, setFirst] = useState(true);

	/**
	 * object names all end with f, gets added here for brevity
	 * @param spline spline scene
	 * @param name name of object
	 * @returns spline object
	 */
	function get(spline: Application, name: string): SPEObject | undefined {
		return spline.findObjectByName(name + "f");
	}

	useEffect(() => {
		if (first) {
			init();
			setFirst(false);
		}
	});

	function init(): void {
		red = new Face(
			["RBW", "BW", "OBW", "OB", "RBW", "OYB", "YB", "RYB"],
			setPieces,
			setAnimating,
			"z",
			"R"
		);
		orange = new Face(
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces,
			setAnimating,
			"x",
			"O"
		);
		yellow = new Face(
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces,
			setAnimating,
			"z",
			"Y"
		);
		green = new Face(
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces,
			setAnimating,
			"y",
			"G"
		);
		blue = new Face(
			["RBW", "BW", "OBW", "OB", "OYB", "YB", "RYB", "RB"],
			setPieces,
			setAnimating,
			"z",
			"B"
		);
		white = new Face(
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces,
			setAnimating,
			"y",
			"W"
		);
	}

	/**
	 * spline scene is finished loading
	 * @param spline spline scene
	 */
	function onLoad(spline: Application): void {
		const loadedFaces: { [key: string]: SPEObject | undefined } = {};
		for (const key in faceNames) {
			loadedFaces[faceNames[key]] = get(spline, faceNames[key]);
		}
		setFaces(loadedFaces);

		const loadedPieces: { [key: string]: SPEObject | undefined } = {};
		for (const key in pieceNames) {
			loadedPieces[pieceNames[key]] = get(spline, pieceNames[key]);
		}
		setPieces(loadedPieces);
	}

	/**
	 * rotate all pieces around the top white face
	 * TODO: allow specifying a face to rotate and direction
	 */
	function U(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			white.animate(pieces, faces);
		}
	}
	function D(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			yellow.animate(pieces, faces);
		}
	}
	function R(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			blue.animate(pieces, faces);
		}
	}
	function L(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			green.animate(pieces, faces);
		}
	}
	function F(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			red.animate(pieces, faces);
		}
	}
	function B(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			orange.animate(pieces, faces);
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

			<button type="button" onClick={() => U()}>
				U
			</button>
			<button type="button" onClick={() => D()}>
				D
			</button>
			<button type="button" onClick={() => R()}>
				R
			</button>
			<button type="button" onClick={() => L()}>
				L
			</button>
			<button type="button" onClick={() => F()}>
				F
			</button>
			<button type="button" onClick={() => B()}>
				B
			</button>
		</div>
	);
}
