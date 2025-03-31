import { FeltController } from "@feltmaps/js-sdk";
import React from "react";

export const FeltContext = React.createContext<FeltController>(
  {} as FeltController
);
export const useFelt = () => React.useContext(FeltContext);
