import React from 'react';
import styled from '@emotion/styled';
import colors from '../../constants/Colors';
import { MdPerson } from 'react-icons/md';
import projectSquirtleLogo from '../../images/projectSquirtle.png';

const StyledHeader = styled.header`
  background-color: ${colors.squirtle_blue};
  color: ${colors.black};
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
      <MdPerson />
      Login
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
