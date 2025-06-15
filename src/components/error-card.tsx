"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function ErrorCard({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: ErrorCardProps) {
  return (
    <div className="center-container">
      <Card className="main-card text-center">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{description}</p>
          {actionLabel &&
            (actionHref || onAction) &&
            (actionHref ? (
              <Link href={actionHref}>
                <Button className="rounded-xl">{actionLabel}</Button>
              </Link>
            ) : (
              <Button onClick={onAction} className="rounded-xl">
                {actionLabel}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
