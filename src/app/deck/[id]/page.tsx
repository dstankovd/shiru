"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Plus, Save } from "lucide-react";
import Link from "next/link";
import { debounce } from "@/lib/utils";
import { FlashcardStorage, type Deck, type Flashcard } from "@/lib/storage";
import { LoadingCard } from "@/components/loading-card";
import { ErrorCard } from "@/components/error-card";
import { toast } from "sonner";

export default function DeckEditor() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    loadDeck();
  }, [params]);

  const loadDeck = () => {
    setIsLoading(true);

    if (!FlashcardStorage.isAvailable()) {
      setStorageAvailable(false);
      setIsLoading(false);
      toast("Local storage is not available. Changes won't be saved.");
      return;
    }

    const foundDeck = FlashcardStorage.getDeck(params.id as string);
    if (foundDeck) {
      setDeck(foundDeck);
      setStorageAvailable(true);
    } else {
      toast("Deck not found");
      router.push("/");
    }
    setIsLoading(false);
  };

  const saveDeck = useCallback(
    (updatedDeck: Deck) => {
      if (!storageAvailable) return;

      if (FlashcardStorage.saveDeck(updatedDeck)) {
        setDeck(updatedDeck);
      } else {
        toast("Failed to save deck");
      }
    },
    [storageAvailable, toast]
  );

  const debouncedSave = useCallback(
    debounce((updatedDeck: Deck) => saveDeck(updatedDeck), 500),
    [saveDeck]
  );

  const updateCard = (
    cardId: string,
    field: "term" | "definition",
    value: string
  ) => {
    if (!deck) return;

    const updatedCards = deck.cards.map((card) =>
      card.id === cardId ? { ...card, [field]: value } : card
    );

    const updatedDeck = { ...deck, cards: updatedCards };
    setDeck(updatedDeck);
    debouncedSave(updatedDeck);
  };

  const deleteCard = (cardId: string) => {
    if (!deck || !storageAvailable) return;

    const updatedCards = deck.cards.filter((card) => card.id !== cardId);
    const updatedDeck = { ...deck, cards: updatedCards };

    if (FlashcardStorage.saveDeck(updatedDeck)) {
      setDeck(updatedDeck);
      toast("Card deleted successfully");
    } else {
      toast("Failed to delete card");
    }
  };

  const addCard = () => {
    if (
      !newTerm.trim() ||
      !newDefinition.trim() ||
      !deck ||
      !storageAvailable
    ) {
      toast(
        !storageAvailable
          ? "Cannot add card - storage is not available"
          : "Both term and definition are required"
      );
      return;
    }

    const newCard: Flashcard = {
      id: Date.now().toString(),
      term: newTerm.trim(),
      definition: newDefinition.trim(),
    };

    const updatedDeck = { ...deck, cards: [...deck.cards, newCard] };

    if (FlashcardStorage.saveDeck(updatedDeck)) {
      setDeck(updatedDeck);
      setNewTerm("");
      setNewDefinition("");
      toast("Card added successfully");
    } else {
      toast("Failed to add card");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addCard();
    }
  };

  if (isLoading) {
    return (
      <LoadingCard
        title="Loading..."
        description="Please wait while we load your deck"
      />
    );
  }

  if (!deck) {
    return (
      <ErrorCard
        title="Deck not found"
        description="The requested deck could not be found"
        actionLabel="Back to Dashboard"
        actionHref="/"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="self-start rounded-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold truncate text-foreground">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {deck.description}
              </p>
            )}
          </div>
          {deck.cards.length > 0 && (
            <Link
              href={`/quiz/${deck.id}`}
              className="self-center sm:self-auto"
            >
              <Button className="rounded-md">Start Studying</Button>
            </Link>
          )}
        </div>

        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"} in
            this deck
          </p>
        </div>
        <Card className="rounded-2xl hover:shadow-md transition-all duration-200 border-border/50 p-2 md:p-4">
          <div className="space-y-6 mb-8">
            <div className="rounded-2xl hover:shadow-md transition-all duration-200 border-border/50 flex flex-row justify-between items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 text-center">
                <label className="text-sm font-medium text-muted-foreground">
                  Term
                </label>
                <label className="text-sm font-medium text-muted-foreground">
                  Definition
                </label>
              </div>
              <div className="w-8" />
            </div>
            {deck.cards.map((card, index) => (
              <div
                key={card.id}
                className="rounded-2xl hover:shadow-md transition-all duration-200 border-border/50 flex flex-row justify-between items-center"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                  <div className="space-y-2">
                    <Input
                      value={card.term}
                      onChange={(e) =>
                        updateCard(card.id, "term", e.target.value)
                      }
                      placeholder="Enter term"
                      className="font-medium rounded-md"
                      disabled={!storageAvailable}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={card.definition}
                      onChange={(e) =>
                        updateCard(card.id, "definition", e.target.value)
                      }
                      placeholder="Enter definition"
                      className="font-medium rounded-md"
                      disabled={!storageAvailable}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCard(card.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-md"
                  disabled={!storageAvailable}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-dashed border-2 transition-all duration-200 hover:border-primary/50 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground">
              <Plus className="w-5 h-5" />
              Add New Card
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Term
                </label>
                <Input
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Enter new term"
                  onKeyDown={handleKeyPress}
                  className="rounded-md"
                  disabled={!storageAvailable}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Definition
                </label>
                <Textarea
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  placeholder="Enter definition"
                  rows={3}
                  className="resize-none rounded-md"
                  onKeyDown={handleKeyPress}
                  disabled={!storageAvailable}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                onClick={addCard}
                disabled={
                  !newTerm.trim() || !newDefinition.trim() || !storageAvailable
                }
                className="w-full sm:w-auto rounded-md"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Card
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                {storageAvailable
                  ? "Press Ctrl+Enter to quickly add card"
                  : "Storage unavailable"}
              </p>
            </div>
          </CardContent>
        </Card>

        {deck.cards.length === 0 && (
          <div className="center-container">
            <Card className="main-card text-center">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first flashcard using the form above
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
