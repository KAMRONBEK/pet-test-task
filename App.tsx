import React from "react";
import { PetProvider } from "./src/context/PetContext";
import MainScreen from "./src/screens/MainScreen";

export default function App() {
  return (
    <PetProvider>
      <MainScreen />
    </PetProvider>
  );
}
