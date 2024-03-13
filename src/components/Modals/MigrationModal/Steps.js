import React, { useCallback, useMemo } from "react";
import "./Steps.scss";
import Step from "./Step";
import config from "config/config";

export const Steps = ({ steps, currentStep }) => {
  const _currentStepNumber = useCallback(() => {
    switch (currentStep) {
      case config.migrationStepsTypes.unstake:
        return 1;
      case config.migrationStepsTypes.approved:
        return 2;
      case config.migrationStepsTypes.liquidity:
        return 3;
      default:
        return null;
    }
  }, [currentStep]);

  const currentStepNumber = useMemo(() => _currentStepNumber(), [_currentStepNumber]);
  const checkActiveStep = (snum) => snum <= currentStepNumber;
  const confirmedStep = (snum) => (snum + 1 <= currentStepNumber || currentStepNumber === (steps.length -1))
  
  return (
    <div className="steps-wrapper">
      <div className="steps-line" />
      {steps.length > 0 &&
        steps.map((step, snum) => step.stepVisibility ? (
            <Step
              key={snum}
              stepNumber={snum}
              stepData={step}
              currentStep={currentStep}
              isActive={checkActiveStep(snum)}
              isConfirmed={confirmedStep(snum)} />) : null
            )}
    </div>
  );
};

export default Steps;
