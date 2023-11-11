import { SPEObject } from "@splinetool/runtime";

export default function debugColorized(
	pieces: { [key: string]: SPEObject | undefined } = {}
) {
	let input: string = Object.values(pieces).reduce(
		(out, piece) => out + (piece?.name.replace("f", "") || "") + "  ",
		""
	);

	const colorMap: { [key: string]: string } = {
		R: "\x1b[1;38;2;255;0;0m",
		O: "\x1b[1;38;2;255;157;0m",
		Y: "\x1b[1;38;2;255;247;0m",
		G: "\x1b[1;38;2;0;255;0m",
		B: "\x1b[1;38;2;0;0;255m",
		W: "\x1b[1;38;2;255;255;255m",
	};

	const resetCode = "\x1b[0m"; // Reset color

	let coloredString = "";
	let insideColorCode = false;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		// is this character in the color map?
		if (char in colorMap) {
			// color the string
			coloredString += resetCode + colorMap[char] + char;
		} else {
			// dont color it
			coloredString += resetCode + char;
		}
	}

	// Ensure the color is reset at the end of the string
	if (insideColorCode) {
		coloredString += resetCode;
	}

	console.log(coloredString);
}
