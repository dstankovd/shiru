"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { FlashcardStorage, type Deck } from "@/lib/storage";
import { LoadingCard } from "@/components/loading-card";
import { ErrorCard } from "@/components/error-card";
import { toast } from "sonner";
import { Question, QuestionGenerator } from "@/lib/question-generator";

export default function StudyMode() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeck();
  }, [params.id]);

  useEffect(() => {
    if (deck?.cards?.length) {
      generateQuestions();
    }
  }, [deck]);

  const loadDeck = () => {
    setIsLoading(true);
    const foundDeck = FlashcardStorage.getDeck(params.id as string);

    if (foundDeck) {
      setDeck(foundDeck);
    } else {
      toast("Deck not found");
      router.push("/");
    }
    setIsLoading(false);
  };

  const generateQuestions = () => {
    if (!deck) return;

    try {
      const generatedQuestions = QuestionGenerator.generateQuestions(deck);
      if (generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsComplete(false);
      } else {
        toast("Could not generate questions for this deck");
        router.push("/");
      }
    } catch {
      toast("Failed to generate questions");
      router.push("/");
    }
  };

  const checkAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct =
      currentQuestion.type === "multiple-choice"
        ? selectedOption === currentQuestion.correctAnswer
        : userAnswer.trim().toLowerCase() ===
          currentQuestion.correctAnswer.toLowerCase();

    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setSelectedOption("");
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const restartStudy = () => {
    generateQuestions();
    setUserAnswer("");
    setSelectedOption("");
    setShowResult(false);
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

  if (deck.cards.length === 0) {
    return (
      <ErrorCard
        title="No Cards Available"
        description="This deck doesn't have any cards yet. Add some cards to start studying."
        actionLabel="Add Cards"
        actionHref={`/deck/${deck.id}`}
      />
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="center-container">
        <Card className="main-card text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">
              Study Complete!
            </CardTitle>
            <CardDescription>Great job studying {deck.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-4xl font-bold mb-2 text-primary">
                {percentage}%
              </div>
              <p className="text-muted-foreground">
                You got {score} out of {questions.length} questions correct
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={restartStudy} className="w-full rounded-md">
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Again
              </Button>
              <Link href={`/deck/${deck.id}`}>
                <Button variant="outline" className="w-full rounded-md">
                  Edit Deck
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full rounded-md">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <LoadingCard
        title="Preparing Questions"
        description="Please wait while we prepare your study session..."
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-xl font-semibold truncate text-foreground">
                {deck.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
            </div>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-3 rounded-full" />
          </div>

          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">
                {currentQuestion.type === "multiple-choice"
                  ? "Multiple Choice"
                  : "Fill in the Blank"}
              </CardTitle>
              <CardDescription>
                {currentQuestion.isTermToDefinition
                  ? "What is the definition of this term?"
                  : "What term matches this definition?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-6 break-words text-center p-4 bg-muted rounded-md text-foreground">
                  {currentQuestion.questionText}
                </h3>

                {currentQuestion.type === "multiple-choice" ? (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedOption === option ? "default" : "outline"
                        }
                        className="w-full text-left justify-start h-auto p-4 text-sm sm:text-base rounded-md"
                        onClick={() => setSelectedOption(option)}
                        disabled={showResult}
                      >
                        <span className="font-medium mr-3 shrink-0">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="break-words">{option}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={showResult}
                    className="text-base rounded-md h-12"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !showResult) {
                        checkAnswer();
                      }
                    }}
                  />
                )}
              </div>

              {showResult && (
                <div
                  className={`p-4 rounded-md mb-4 ${
                    isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        isCorrect ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="text-sm text-gray-700">
                      The correct answer is:{" "}
                      <strong>{currentQuestion.correctAnswer}</strong>
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                {!showResult ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={
                      currentQuestion.type === "multiple-choice"
                        ? !selectedOption
                        : !userAnswer.trim()
                    }
                    className="w-full sm:w-auto rounded-md h-12 px-8"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="w-full sm:w-auto rounded-md h-12 px-8"
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "Finish"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
