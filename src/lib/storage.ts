interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "shiru-flashcard-decks";

export class FlashcardStorage {
  static loadDecks(): Deck[] {
    try {
      if (typeof window === "undefined") return [];

      const savedDecks = localStorage.getItem(STORAGE_KEY);
      if (!savedDecks) return [];

      const decks = JSON.parse(savedDecks);
      if (!Array.isArray(decks)) return [];

      return decks.filter(
        (deck: any) => deck?.id && deck?.name && Array.isArray(deck?.cards)
      );
    } catch {
      return [];
    }
  }

  static saveDecks(decks: Deck[]): boolean {
    try {
      if (typeof window === "undefined" || !Array.isArray(decks)) return false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
      return true;
    } catch {
      return false;
    }
  }

  static getDeck(deckId: string): Deck | null {
    return this.loadDecks().find((deck) => deck.id === deckId) || null;
  }

  static saveDeck(updatedDeck: Deck): boolean {
    const decks = this.loadDecks();
    const deckIndex = decks.findIndex((deck) => deck.id === updatedDeck.id);

    const deckWithTimestamp = {
      ...updatedDeck,
      updatedAt: new Date().toISOString(),
    };

    if (deckIndex >= 0) {
      decks[deckIndex] = deckWithTimestamp;
    } else {
      decks.push(deckWithTimestamp);
    }

    return this.saveDecks(decks);
  }

  static deleteDeck(deckId: string): boolean {
    const decks = this.loadDecks().filter((deck) => deck.id !== deckId);
    return this.saveDecks(decks);
  }

  static createDeck(
    deckData: Omit<Deck, "id" | "createdAt" | "updatedAt">
  ): Deck | null {
    const newDeck: Deck = {
      ...deckData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveDeck(newDeck) ? newDeck : null;
  }

  static isAvailable(): boolean {
    try {
      if (typeof window === "undefined") return false;
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export type { Deck, Flashcard };
