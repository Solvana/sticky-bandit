import * as React from 'react';
import { throttle } from 'frame-throttle';
import { CardList, HEADLINE_MARGIN_BOTTOM, ScrollGroup, StickyCardWrapper, StickyHeadlineGroup } from './styles';
import { styleForCurrentCardIndex, Style, Configuration } from './helpers';

type Card = {
  key: string;
  component: React.ReactElement;
};

type Props = {
  cards: Card[];
  header?: React.ReactNode;
  configuration: Configuration;
};

const StickyBandit: React.FC<Props> = ({ cards, header, configuration }: Props) => {
  const headlineRef = React.useRef<HTMLDivElement>(null);
  const [headlineHeight, setHeadlineHeight] = React.useState(0);
  const cardRefs = React.useRef<HTMLLIElement[]>([]);

  React.useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);
  }, [cards]);

  const [styles, setStyles] = React.useState<Style[]>([]);

  const listener = throttle(() => {
    const headlineYPos = headlineRef?.current?.getBoundingClientRect().y || 0;
    const viewBoundsTop = headlineYPos + headlineHeight + HEADLINE_MARGIN_BOTTOM;

    const newStyles = cardRefs.current.map((_, i) =>
      styleForCurrentCardIndex(i, cardRefs, viewBoundsTop, configuration),
    );
    setStyles(newStyles);
  });

  React.useEffect(() => {
    window.addEventListener('scroll', listener);
    return () => window.removeEventListener('scroll', listener);
  });

  React.useLayoutEffect(() => {
    setHeadlineHeight(headlineRef!.current!.offsetHeight || 0);
  }, [headlineRef]);

  return (
    <ScrollGroup>
      <StickyHeadlineGroup headlineHeight={headlineHeight} ref={headlineRef}>
        {header}
      </StickyHeadlineGroup>

      <CardList headlineHeight={headlineHeight}>
        {cards.map((card, index) => (
          <StickyCardWrapper
            style={styles[index]}
            key={card.key}
            ref={(el: HTMLLIElement) => (index <= cardRefs.current.length ? (cardRefs.current[index] = el) : null)}
          >
            {card.component}
          </StickyCardWrapper>
        ))}
      </CardList>
    </ScrollGroup>
  );
};

export default StickyBandit;
