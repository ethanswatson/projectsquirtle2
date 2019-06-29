import React, { Component } from 'react';
import styled from '@emotion/styled';
import Page from '../components/shared/Page';
import Button from '../components/shared/Button';

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
`;

const StyledInput = styled.input`
  width: 300px;
  height: 50px;
`;

export default class HomePage extends Component {
  render() {
    return (
      <Page>
        <StyledDiv>
          <StyledInput placeholder='Session ID' />
          <Button>Join</Button>
          Or Create a Quiz
        </StyledDiv>
      </Page>
    );
  }
}
