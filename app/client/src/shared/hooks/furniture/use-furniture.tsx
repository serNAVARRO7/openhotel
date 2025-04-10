import { useContext } from "react";
import { FurnitureContext, FurnitureState } from "./furniture.context";

export const useFurniture = (): FurnitureState => useContext(FurnitureContext);
