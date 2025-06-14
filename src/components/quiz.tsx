"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { pickRandomElement, shuffleArray } from "@/lib/utils";
import { countriesData } from "@/lib/countries-data";
import ProgressTracker from "./progress-tracker";

type AnswerStatus = "unanswered" | "correct" | "incorrect";
type QuestionMode = "flags" | "capitals";
export type QuizMode = "flags" | "capitals" | "mixed";

interface QuizState {
  questions: {
    mode: "flags" | "capitals";
    flag: string;
    capital: string;
    correctAnswer: string;
    options: string[];
    status: AnswerStatus;
    selectedAnswer?: string;
  }[];
  currentQuestionIndex: number;
  gameCompleted: boolean;
}

export default function Quiz({ mode }: { mode: QuizMode }) {
  const questionModeOptions: QuestionMode[] =
    mode === "mixed" ? ["flags", "capitals"] : [mode];

  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    gameCompleted: false,
  });

  useEffect(() => {
    const allCountries = [...countriesData];
    shuffleArray(allCountries);

    const quizQuestions = allCountries.slice(0, 15).map((country) => {
      const incorrectOptions = allCountries
        .filter((f) => f.name !== country.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((f) => f.name);

      const options = [country.name, ...incorrectOptions];
      shuffleArray(options);

      const questionMode = pickRandomElement(questionModeOptions);

      return {
        mode: questionMode,
        capital: country.capital,
        flag: country.image,
        correctAnswer: country.name,
        options,
        status: "unanswered" as AnswerStatus,
      };
    });

    setQuizState((prev) => ({
      ...prev,
      questions: quizQuestions,
    }));
  }, []);

  const handleAnswer = (selectedAnswer: string) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const updatedQuestions = [...quizState.questions];
    updatedQuestions[quizState.currentQuestionIndex] = {
      ...currentQuestion,
      status: isCorrect ? "correct" : "incorrect",
      selectedAnswer,
    };

    setQuizState((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));

    setTimeout(() => {
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        setQuizState((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
      } else {
        setQuizState((prev) => ({
          ...prev,
          gameCompleted: true,
        }));
      }
    }, 2000);
  };

  const restartGame = () => {
    router.push("/");
  };

  if (quizState.questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const score = quizState.questions.filter(
    (q) => q.status === "correct"
  ).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ProgressTracker
        questions={quizState.questions}
        currentIndex={quizState.currentQuestionIndex}
      />

      {quizState.gameCompleted ? (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Game Completed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold mb-4">
              {score} / {quizState.questions.length}
            </p>
            <p className="text-lg mb-6">
              {score === quizState.questions.length
                ? "Perfect score! You're a countries expert!"
                : score > quizState.questions.length / 2
                ? "Great job! You know your countries well."
                : "Keep practicing to improve your countries knowledge!"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={restartGame} size="lg">
              Play Again
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Question {quizState.currentQuestionIndex + 1} of{" "}
              {quizState.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-full max-w-xs mb-6">
              {currentQuestion.mode === "flags" ? (
                <img
                  src={currentQuestion.flag}
                  alt="Flag"
                  className="w-full h-auto border border-gray-200 rounded-md shadow-sm"
                />
              ) : (
                <p className="text-center">
                  <span className="font-bold">{currentQuestion.capital}</span>{" "}
                  is the capital of{" "}
                </p>
              )}
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "";

                if (currentQuestion.selectedAnswer) {
                  if (option === currentQuestion.correctAnswer) {
                    buttonClass =
                      "!bg-green-500 !hover:bg-green-600 text-white";
                  } else if (option === currentQuestion.selectedAnswer) {
                    buttonClass = "!bg-red-500 !hover:bg-red-600 text-white";
                  } else {
                    buttonClass = "opacity-50";
                  }
                }

                return (
                  <Button
                    key={index}
                    className={`text-left justify-start h-auto py-3 px-4 ${buttonClass}`}
                    onClick={() =>
                      !currentQuestion.selectedAnswer && handleAnswer(option)
                    }
                    disabled={!!currentQuestion.selectedAnswer}
                    variant="outline"
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
