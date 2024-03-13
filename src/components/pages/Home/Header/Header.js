import { EnterApp } from "components/Navbar/Navbar";
import React, { useMemo } from "react";
import "./Header.scss";
import TotalValueLocked from "components/TotalValueLocked";

const Header = () => {
  return useMemo(() => {
    return (
      <div className="header-component">
        <div className="header-component__container">
          <h1>Crypto Volatility Index</h1>
          <h2>Make Volatility Your Asset</h2>
          <p>
            The Crypto Volatility Index (CVI) is a decentralized VIX for crypto
            that allows users
            <br /> to hedge themselves against market volatility and impermanent
            loss.
          </p>
          <EnterApp />
        </div>
        <TotalValueLocked placement="home" />
      </div>
    );
  }, []);
};

export default Header;
