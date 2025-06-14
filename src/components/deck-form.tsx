"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeckFormProps {
  title: string;
  description: string;
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function DeckForm({
  title,
  description,
  initialName = "",
  initialDescription = "",
  onSubmit,
  onCancel,
  submitLabel,
}: DeckFormProps) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDescription);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name, desc);
  };

  return (
    <DialogContent className="rounded-2xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="deck-name">Deck Name</Label>
          <Input
            id="deck-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter deck name"
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="deck-description">Description (Optional)</Label>
          <Textarea
            id="deck-description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter deck description"
            className="rounded-xl"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="rounded-xl"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
