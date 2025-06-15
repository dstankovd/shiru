"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  Download,
  Upload,
  Trash2,
  Edit,
  Play,
} from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { useStorage } from "@/hooks/use-storage";
import { LoadingCard } from "@/components/loading-card";
import { DeckForm } from "@/components/deck-form";
import type { Deck } from "@/lib/storage";

export default function Dashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const {
    decks,
    isLoading,
    isAvailable,
    createDeck,
    updateDeck,
    deleteDeck,
    importDeck,
  } = useStorage();

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
    return (
      <LoadingCard
        title="Loading..."
        description="Loading your flashcard decks..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            Flashcard Study App
          </h1>
          <p className="text-lg text-muted-foreground">
            Create, manage, and study your flashcard collections
          </p>
        </div>

        <div className="flex justify-center mb-8 gap-3">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-deck"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-deck")?.click()}
            disabled={!isAvailable}
            className="rounded-md"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Deck
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAvailable} className="rounded-md px-6">
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
        </div>

        {decks.length === 0 ? (
          <div className="center-container">
            <Card className="main-card text-center">
              <CardContent className="pt-6">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No decks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first flashcard deck to get started
                </p>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-md"
                  disabled={!isAvailable}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Deck
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="rounded-2xl hover:shadow-lg transition-all duration-200 border-border/50"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg truncate text-foreground">
                    {deck.name}
                  </CardTitle>
                  {deck.description && (
                    <CardDescription className="line-clamp-2">
                      {deck.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{deck.cards.length} cards</span>
                    <span>
                      Updated {new Date(deck.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Link href={`/deck/${deck.id}`} className="flex-1">
                        <Button variant="outline" className="w-full rounded-md">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Cards
                        </Button>
                      </Link>
                      {deck.cards.length > 0 && (
                        <Link href={`/quiz/${deck.id}`} className="flex-1">
                          <Button className="w-full rounded-md">
                            <Play className="w-4 h-4 mr-2" />
                            Study
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDeck(deck)}
                        className="flex-1 rounded-md"
                        disabled={!isAvailable}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(deck)}
                        className="flex-1 rounded-md"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDeck(deck.id)}
                        className="text-destructive hover:text-destructive rounded-md"
                        disabled={!isAvailable}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}
