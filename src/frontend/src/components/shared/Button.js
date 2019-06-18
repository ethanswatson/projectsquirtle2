import React, { Component } from 'react';
import styled from '@emotion/styled';
import colors from '../../constants/Colors';

const StyledButton = styled.button`
  background-color: ${colors.squirtle_dark_blue};
  color: ${colors.white};
  border: 0;
  padding: 15px;
  margin: 5px;
  border-radius: 15px;
  font-size: 16px;
`;

export default class Button extends Component {
  render() {
    return (
      <a href={this.props.href}>
        <StyledButton>{this.props.children}</StyledButton>
      </a>
    );
  }
}
