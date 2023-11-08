import "./App.css";
import { useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";
import { Application, SPEObject } from "@splinetool/runtime";
import Face from "./components/Face";
import debugColorized from "./components/debugColorized";
import { faceNames, pieceNames } from "./names.ts";

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
	const [faces, setFaces] = useState<Array<SPEObject | undefined>>(Array(6));
	const [pieces, setPieces] = useState<Array<SPEObject | undefined>>(Array(20));
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
		if (pieces.some((obj) => obj) && faces.some((obj) => obj)) {
			if (first) {
				init();
				setFirst(false);
			}
		}
	});

	function init(): void {
		white = new Face(
			["OGW", "OW", "OBW", "BW", "RBW", "RW", "RGW", "GW"],
			setPieces,
			setAnimating
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
	 */
	function rotateAnimation(): void {
		//* don't allow animation to begin while an animation is still being played
		if (!animating) {
			white.animate(pieces, faces);
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

			<button type="button" onClick={() => rotateAnimation()}>
				Move Cube
			</button>
		</div>
	);
}
