import type { Deck, Flashcard } from "@/lib/storage";

export type QuestionType = "multiple-choice" | "fill-in-blank";

export interface Question {
  card: Flashcard;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  questionText: string;
  isTermToDefinition: boolean;
}

export class QuestionGenerator {
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static generateQuestions(deck: Deck): Question[] {
    if (!deck?.cards?.length) return [];

    const allQuestions: Question[] = [];

    deck.cards.forEach((card) => {
      allQuestions.push(
        this.generateMultipleChoiceQuestion(deck, card, true),
        this.generateMultipleChoiceQuestion(deck, card, false),
        this.generateFillInBlankQuestion(card, true),
        this.generateFillInBlankQuestion(card, false)
      );
    });

    return this.shuffleArray(allQuestions);
  }

  private static generateMultipleChoiceQuestion(
    deck: Deck,
    card: Flashcard,
    isTermToDefinition: boolean
  ): Question {
    const correctAnswer = isTermToDefinition ? card.definition : card.term;
    const questionText = isTermToDefinition ? card.term : card.definition;

    const otherCards = deck.cards.filter((c) => c.id !== card.id);
    const wrongAnswers = this.shuffleArray(
      otherCards.map((c) => (isTermToDefinition ? c.definition : c.term))
    ).slice(0, Math.min(3, otherCards.length));

    while (wrongAnswers.length < 3) {
      wrongAnswers.push(`Wrong answer ${wrongAnswers.length + 1}`);
    }

    const options = this.shuffleArray([correctAnswer, ...wrongAnswers]);

    return {
      card,
      type: "multiple-choice",
      options,
      correctAnswer,
      questionText,
      isTermToDefinition,
    };
  }

  private static generateFillInBlankQuestion(
    card: Flashcard,
    isTermToDefinition: boolean
  ): Question {
    const correctAnswer = isTermToDefinition ? card.definition : card.term;
    const questionText = isTermToDefinition ? card.term : card.definition;

    return {
      card,
      type: "fill-in-blank",
      correctAnswer,
      questionText,
      isTermToDefinition,
    };
  }
}
