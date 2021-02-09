import * as React from 'react';

export type Configuration = {
  maxTranslateY: number; // The maximum amount to translate Y (in pixels)
  minOpacityThreshold: number; // Any calculated opacity values less than this amount will automatically be set to 0
  maxScaleDelta: number; // The maximum scale variation based on original size
  startOpacityChangeAtPercentOverlap: number; // The percent of overlap required before changing opacity
  endOpacityChangeAtPercentOverlap: number; // The percent of overlap required where the opacity is 0
  startScaleChangeAtPercentOverlap: number; // The percent of overlap required before changing the scale
  startTranslateYChangeAtPercentOverlap: number; // The percent of overlap required before changing translate-y
};

const DEFAULT_CONFIG = {
  maxScaleDelta: 0.05,
  maxTranslateY: 40,
  minOpacityThreshold: 0.05,
  startOpacityChangeAtPercentOverlap: 1 / 3,
  endOpacityChangeAtPercentOverlap: 1,
  startScaleChangeAtPercentOverlap: 1 / 3,
  startTranslateYChangeAtPercentOverlap: 1 / 3,
} as Configuration;

type Options = {
  [K in keyof Configuration]?: Configuration[K];
};

export const createStickyBanditConfig = (options: Options): Configuration => ({
  ...DEFAULT_CONFIG,
  ...options,
});

const calculateTranslateY = (
  currentCard: DOMRect,
  nextCard: DOMRect,
  { maxTranslateY, startTranslateYChangeAtPercentOverlap }: Configuration,
): number => {
  const overlapDifference = nextCard.top - currentCard.top;

  const startPosition = currentCard.height - startTranslateYChangeAtPercentOverlap * currentCard.height;
  if (overlapDifference > startPosition) {
    return 0;
  }

  const percentOverlap = overlapDifference / startPosition;
  const normalizedMultiplier = percentOverlap > 1 ? 1 : percentOverlap;

  return maxTranslateY - maxTranslateY * normalizedMultiplier;
};

const cardIsExitingView = (card: DOMRect, viewBoundsTop: number): boolean => card.top < viewBoundsTop;

const calculateOpacity = (
  index: number,
  refs: React.MutableRefObject<HTMLLIElement[]>,
  viewBoundsTop: number,
  { minOpacityThreshold, startOpacityChangeAtPercentOverlap, endOpacityChangeAtPercentOverlap }: Configuration,
): number => {
  const currentCard = refs.current[index].getBoundingClientRect();
  const nextCard = refs.current[index + 1].getBoundingClientRect();

  const isSecondToLastCard = index === refs.current.length - 2;
  if (isSecondToLastCard && cardIsExitingView(nextCard, viewBoundsTop)) {
    return 0;
  }

  const offset = (1 - endOpacityChangeAtPercentOverlap) * currentCard.height;
  const overlapDifference = nextCard.top - (currentCard.top + offset);

  const startPosition = currentCard.height - startOpacityChangeAtPercentOverlap * currentCard.height;
  if (overlapDifference > startPosition) {
    return 1;
  }

  const opacity = overlapDifference / startPosition;

  if (opacity > 1) {
    return 1;
  }

  return opacity < minOpacityThreshold ? 0 : opacity;
};

const calculateScale = (
  currentCard: DOMRect,
  nextCard: DOMRect,
  { startScaleChangeAtPercentOverlap, maxScaleDelta }: Configuration,
): number => {
  const overlapDifference = nextCard.top - currentCard.top;

  const startPosition = currentCard.height - startScaleChangeAtPercentOverlap * currentCard.height;
  if (overlapDifference > startPosition) {
    return 1;
  }

  const multiplier = (startPosition - overlapDifference) / startPosition;
  const normalizedMultiplier = multiplier < 1 && multiplier > 0 ? multiplier : 1;

  return 1 - maxScaleDelta * normalizedMultiplier;
};

export type Style = {
  opacity?: number;
  transform?: string;
};

export const styleForCurrentCardIndex = (
  index: number,
  refs: React.MutableRefObject<HTMLLIElement[]>,
  viewBoundsTop: number,
  configuration: Configuration,
): Style => {
  const hasIndexOverflow = index < 0 || index > refs.current.length - 1;
  if (hasIndexOverflow) {
    return {};
  }

  const isLastCardView = index === refs.current.length - 1;
  if (isLastCardView) {
    return {};
  }

  const currentCard = refs.current[index].getBoundingClientRect();
  const nextCard = refs.current[index + 1].getBoundingClientRect();

  const scale = calculateScale(currentCard, nextCard, configuration);
  const translateY = calculateTranslateY(currentCard, nextCard, configuration);
  const opacity = calculateOpacity(index, refs, viewBoundsTop, configuration);

  return {
    opacity,
    transform: `translate(0px, -${translateY}px) scale(${scale}, ${scale})`,
  };
};
