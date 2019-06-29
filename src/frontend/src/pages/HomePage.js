import React, { Component } from 'react';
import styled from '@emotion/styled';
import Page from '../components/shared/Page';
import Button from '../components/shared/Button';

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export default class HomePage extends Component {
  render() {
    return (
      <Page>
        <StyledButtonContainer>
          <Button isLarge={true}>Join Quiz</Button>
          <Button isLarge={true}>Create Quiz</Button>
        </StyledButtonContainer>
      </Page>
    );
  }
}
