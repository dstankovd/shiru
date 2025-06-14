import Quiz, { QuizMode } from "@/components/quiz";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!["flags", "capitals", "mixed"].includes(mode)) {
    return (
      <main className="flex min-h-screen flex-col items-center p-4 bg-background">
        Invalid quiz mode.
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-background">
      <Quiz mode={mode as QuizMode} />
    </main>
  );
}
