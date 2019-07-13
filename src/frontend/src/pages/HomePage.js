import React, { Component } from 'react';
import styled from '@emotion/styled';
import Page from '../components/shared/Page';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';

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
          <Input placeholder='Session ID' />
          <Button variant='contained' color='primary' size='large'>
            Join
          </Button>
          <Button>Or Create a Quiz</Button>
        </StyledDiv>
      </Page>
    );
  }
}
