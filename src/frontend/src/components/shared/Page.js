import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import styled from '@emotion/styled';
import colors from '../../constants/Colors';
import GlobalHeader from './GlobalHeader';

const StyledPage = styled.main`
  background-color: ${colors.squirtle_gray};
  color: ${colors.white};
  height: 100vh;
  min-height: 100vh;
`;

export default class Page extends Component {
  render() {
    return (
      <StyledPage>
        <GlobalHeader />
        <Container>{this.props.children}</Container>
      </StyledPage>
    );
  }
}
