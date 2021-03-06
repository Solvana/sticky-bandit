import styled from 'styled-components';

enum BaseStickyTop {
  Mobile = '100px',
}

export const HEADLINE_MARGIN_BOTTOM = 50;

type StickyProps = {
  headlineHeight: number;
  tabletXLargeSize: string;
};

export const StickyHeadlineGroup = styled.div<StickyProps>`
  position: sticky;
  top: ${BaseStickyTop.Mobile};

  margin-bottom: ${({ headlineHeight }) => {
    const hasHeader = headlineHeight > 0;
    return hasHeader ? `${HEADLINE_MARGIN_BOTTOM}px` : 0;
  }};
`;

export const StickyCardWrapper = styled.li`
  position: sticky;
  border-radius: 3px;
  box-shadow: 0 22px 84px -20px rgba(0, 0, 0, 0.21);
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const calculateCardListTop = ({ headlineHeight }: StickyProps, baseOffset: BaseStickyTop) => {
  const hasHeaderContent = headlineHeight > 0;
  if (hasHeaderContent) {
    return `calc(${baseOffset} + ${headlineHeight}px + ${HEADLINE_MARGIN_BOTTOM}px);`;
  }

  return `${baseOffset};`;
};

export const CardList = styled.ul<StickyProps>`
  ${StickyCardWrapper} {
    top: ${(p) => calculateCardListTop(p, BaseStickyTop.Mobile)};
  }

  // prettier-ignore
  ${StickyCardWrapper}:not(:first-child) {
    margin-top: 100px;
  }
`;

export const ScrollGroup = styled.div`
  margin: 0 auto;
  text-align: center;
  width: 100%;
`;
