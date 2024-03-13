import React from "react";
import Button from "components/Elements/Button";

export const Unstake = ({ stepDetails, stakedBalance, onClickHandler, disabled, isLoading }) => {

  // TODO : Change to EXIT function - claim GOVI after UNSTAKE
  return (
    <div className="migration-step-wrapper">
      <div className="step-details">
        {stepDetails.stepDesc &&
          stepDetails.stepDesc.map((stepDesc, tn) => (
            <p key={tn}>{stepDesc}</p>
          ))}
        <div className="user-amount bold">
          <p>Amount</p>
          <p>{stakedBalance} USDT LP </p>
        </div>
      </div>
      <div className="actions-wrapper">
        <Button
          className="button step-button"
          buttonText={stepDetails.stepButton[0]}
          onClick={onClickHandler} 
          processing={isLoading}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default Unstake;
