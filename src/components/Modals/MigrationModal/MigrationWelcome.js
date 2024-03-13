import React from "react";
import Button from "components/Elements/Button";

export const MigrationWelcome = ({ stepDetails, onClickHandler, disabled, isLoading}) => {
  return (
    <div className="migration-welcome-wrapper">
     <img className="migration-coin-image" src={require('../../../images/coins/usdt2usdc.svg').default} alt="migration-coin" />
      <div className="step-details">
        {stepDetails.stepDesc &&
          stepDetails.stepDesc.map((stepDesc, tn) => (
            <p key={tn}>{stepDesc}</p>
          ))}
      </div>
      <div className="actions-wrapper">
        <Button
          className="button step-button"
          buttonText={stepDetails.stepButton[0]}
          onClick={onClickHandler} 
          disabled={disabled}
          processing={isLoading}
        />
      </div>
    </div>
  );
};

export default MigrationWelcome;