"use client";

import { DeckForm } from "@/components/deck-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useStorage } from "@/hooks/use-storage";
import { Deck } from "@/lib/storage";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function LoadingCard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Shiru</CardTitle>
          <CardDescription>Flashcard learning app</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 items-center justify-center">
          Loading
        </CardContent>
        <CardFooter className="flex justify-end">
          <ModeToggle />
        </CardFooter>
      </Card>
    </main>
  );
}

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const { decks, isLoading, createDeck, updateDeck, deleteDeck, importDeck } =
    useStorage();

  const handleCreateDeck = (name: string, description: string) => {
    if (createDeck(name, description)) {
      setIsCreateOpen(false);
    }
  };

  const handleUpdateDeck = (name: string, description: string) => {
    if (editingDeck && updateDeck({ ...editingDeck, name, description })) {
      setEditingDeck(null);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const deckData = JSON.parse(e.target?.result as string);
        importDeck(deckData);
      } catch {
        // Error handling is done in the hook
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExport = (deck: Deck) => {
    try {
      const dataStr = JSON.stringify(deck, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${deck.name
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail for export
    }
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Shiru</CardTitle>
          <CardDescription>Flashcard learning app</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 items-center justify-center">
          <ScrollArea className="w-full h-96">
            {decks.map((deck) => (
              <Button key={deck.id} size="lg" asChild>
                <Link
                  className="w-full max-w-xs text-lg py-6"
                  href={`/deck/${deck.id}`}
                >
                  {deck.name}
                  <p className="text-secondary-foreground">
                    {deck.description}
                  </p>
                </Link>
              </Button>
            ))}
          </ScrollArea>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl px-6">
                <Plus className="w-4 h-4 mr-2" />
                Create New Deck
              </Button>
            </DialogTrigger>
            <DeckForm
              title="Create New Deck"
              description="Create a new flashcard deck to start studying"
              onSubmit={handleCreateDeck}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel="Create Deck"
            />
          </Dialog>
        </CardContent>

        <CardFooter className="flex justify-end">
          <ModeToggle />
        </CardFooter>
      </Card>

      <Dialog open={!!editingDeck} onOpenChange={() => setEditingDeck(null)}>
        {editingDeck && (
          <DeckForm
            title="Edit Deck"
            description="Update your deck name and description"
            initialName={editingDeck.name}
            initialDescription={editingDeck.description}
            onSubmit={handleUpdateDeck}
            onCancel={() => setEditingDeck(null)}
            submitLabel="Update Deck"
          />
        )}
      </Dialog>
    </main>
  );
}
