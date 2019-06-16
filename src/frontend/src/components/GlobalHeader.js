import React from 'react';
import styled from '@emotion/styled';
import projectSquirtleLogo from '../images/projectSquirtle.png';

const StyledHeader = styled.header`
  background-color: #ca6610;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const StyledDiv = styled.div`
  position: absolute;
  right: 0;
  margin-right: 20px;
`;

const StyledLogoContainer = styled.div`
  align-self: center;
  padding: 10px;
`;

const StyledLogo = styled.img`
  max-width: 100%;
  height: auto;
`;

function LoginModule() {
  return (
    <StyledDiv>
      <span>Login</span>
      <span>Register</span>
    </StyledDiv>
  );
}

function GlobalHeader() {
  return (
    <StyledHeader>
      <StyledLogoContainer>
        <StyledLogo src={projectSquirtleLogo} />
      </StyledLogoContainer>
      <LoginModule />
    </StyledHeader>
  );
}

export default GlobalHeader;
