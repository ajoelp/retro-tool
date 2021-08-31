import styled from 'styled-components';
import { white } from '../../theme/colors';
import { ShadowMD, ShadowSM } from '../../theme/shadows';

type CardProps = {
  padding?: boolean;
};

export const Card = styled.div<CardProps>`
  width: 9rem;
  height: 9rem;
  background-color: white;
  border: 1px solid #efefef;
`;
