import { Card, CardContent } from "@/components/ui/card";

interface LoadingCardProps {
  title: string;
  description: string;
}

export function LoadingCard({ title, description }: LoadingCardProps) {
  return (
    <div className="center-container">
      <Card className="main-card text-center">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
