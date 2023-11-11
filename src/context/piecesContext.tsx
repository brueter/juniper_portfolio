import { SPEObject } from "@splinetool/runtime";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context value
type PiecesContextValue = {
	pieces: (SPEObject | undefined)[];
	setPieces: React.Dispatch<React.SetStateAction<(SPEObject | undefined)[]>>;
};

// Create the context with a defaultValue
const defaultValue: PiecesContextValue = {
	pieces: Array(20).fill(undefined), // Initialize with undefined values
	setPieces: () => {},
};

export const PiecesContext = createContext(defaultValue);

export const usePieces = () => {
	return useContext(PiecesContext);
};

export const PiecesProvider = ({ children }: { children: ReactNode }) => {
	const [pieces, setPieces] = useState<(SPEObject | undefined)[]>(
		Array(20).fill(undefined)
	);

	return (
		<PiecesContext.Provider value={{ pieces, setPieces }}>
			{children}
		</PiecesContext.Provider>
	);
};
