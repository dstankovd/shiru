"use client";

import { useState, useEffect } from "react";
import { FlashcardStorage, type Deck } from "@/lib/storage";
import { toast } from "sonner";

export function useStorage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    setIsLoading(true);

    if (!FlashcardStorage.isAvailable()) {
      setIsAvailable(false);
      setIsLoading(false);
      toast("Local storage is not available. Your data won't be saved.");
      return;
    }

    try {
      const loadedDecks = FlashcardStorage.loadDecks();
      setDecks(loadedDecks);
      setIsAvailable(true);
    } catch {
      toast("Failed to load decks from storage");
    } finally {
      setIsLoading(false);
    }
  };

  const createDeck = (name: string, description: string) => {
    if (!isAvailable) {
      toast("Cannot save deck - storage is not available");
      return false;
    }

    const newDeck = FlashcardStorage.createDeck({
      name: name.trim(),
      description: description.trim(),
      cards: [],
    });

    if (newDeck) {
      setDecks(FlashcardStorage.loadDecks());
      toast("Deck created successfully");
      return true;
    } else {
      toast("Failed to create deck");
      return false;
    }
  };

  const updateDeck = (deck: Deck) => {
    if (!isAvailable) {
      toast("Cannot update deck - storage is not available");
      return false;
    }

    const success = FlashcardStorage.saveDeck(deck);
    if (success) {
      setDecks(FlashcardStorage.loadDecks());
      toast("Deck updated successfully");
      return true;
    } else {
      toast("Failed to update deck");
      return false;
    }
  };

  const deleteDeck = (deckId: string) => {
    if (!isAvailable) {
      toast("Cannot delete deck - storage is not available");
      return false;
    }

    const success = FlashcardStorage.deleteDeck(deckId);
    if (success) {
      setDecks(FlashcardStorage.loadDecks());
      toast("Deck deleted successfully");
      return true;
    } else {
      toast("Failed to delete deck");
      return false;
    }
  };

  const importDeck = (deckData: any) => {
    if (!isAvailable) {
      toast("Cannot import deck - storage is not available");
      return false;
    }

    try {
      if (!deckData.name || !Array.isArray(deckData.cards)) {
        throw new Error("Invalid deck format");
      }

      const newDeck = FlashcardStorage.createDeck({
        name: deckData.name,
        description: deckData.description || "",
        cards: deckData.cards || [],
      });

      if (newDeck) {
        setDecks(FlashcardStorage.loadDecks());
        toast("Deck imported successfully");
        return true;
      } else {
        throw new Error("Failed to save imported deck");
      }
    } catch {
      toast("Failed to import deck. Please check the file format.");
      return false;
    }
  };

  return {
    decks,
    isLoading,
    isAvailable,
    createDeck,
    updateDeck,
    deleteDeck,
    importDeck,
    refreshDecks: loadDecks,
  };
}
