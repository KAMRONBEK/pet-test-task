import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pet } from "../types";

type PetContextType = {
  pets: Pet[];
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (id: string) => void;
};

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pets, setPets] = useState<Pet[]>([]);

  const STORAGE_KEY = "@pets_data";

  useEffect(() => {
    const loadPets = async () => {
      try {
        const storedPets = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPets) {
          setPets(JSON.parse(storedPets));
        }
      } catch (error) {
        console.error("Failed to load pets from storage:", error);
      }
    };

    loadPets();
  }, []);

  useEffect(() => {
    const savePets = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
      } catch (error) {
        console.error("Failed to save pets to storage:", error);
      }
    };

    savePets();
  }, [pets]);

  const addPet = (pet: Pet) => {
    setPets((prevPets) => [...prevPets, pet]);
  };

  const updatePet = (updatedPet: Pet) => {
    setPets((prevPets) =>
      prevPets.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet))
    );
  };

  const deletePet = (id: string) => {
    setPets((prevPets) => prevPets.filter((pet) => pet.id !== id));
  };

  return (
    <PetContext.Provider value={{ pets, addPet, updatePet, deletePet }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePetContext = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePetContext must be used within a PetProvider");
  }
  return context;
};
