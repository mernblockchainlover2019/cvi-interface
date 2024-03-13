import React, { useCallback, useMemo, useState } from "react";
import Tooltip from "components/Tooltip";
import config from '../../config/config';
import "./Slippage.scss";
import { customFixed } from 'utils';

const Slippage = ({slippageTolerance, setSlippageTolerance}) => {
  const [costumTolerance, setCostumTolerance] = useState("");
  const [inputSlippageFocus, setInputSlippageFocus] = useState(false);

  const slippageButtons = useMemo(() => ({ // @TODO: move it to config.js
    buttons: ["0.5", "1", "2"],
  }), []);

  const isFixedTolerance = slippageButtons.buttons.includes(slippageTolerance);

  const slippageBtnHandler = useCallback((val) => {
    if (slippageTolerance !== val) {
      setSlippageTolerance(val);
      setCostumTolerance("");
    }
  }, [setSlippageTolerance, slippageTolerance]);

  const customSlippageInput = ({target: { value }}) => {
    //eslint-disable-next-line
      var numbersOnly = /[^0-9][\.,]/g;
      let valNoLetters = value?.replace(numbersOnly, '');
      if (valNoLetters >= 0 && valNoLetters < 100) {
        let costumTolerance = valNoLetters
        setCostumTolerance(customFixed(costumTolerance, 2));
        setSlippageTolerance(customFixed(costumTolerance, 2));
      }
  }


  return (
    <div className="slippage-component">
      <span className="slippage-title">
        {config.statisticsDetails.slippageTolerance.title}
        <Tooltip
          type="question"
          left={config.statisticsDetails.slippageTolerance.tooltip?.left ?? -30}
          mobileLeft={config.statisticsDetails.slippageTolerance.tooltip?.mobileLeft}
          maxWidth={400}
          minWidth={250}
          content={config.statisticsDetails.slippageTolerance.tooltip?.content}
        />
      </span>

      <div className="slippage-buttons-group">
        {slippageButtons.buttons &&
          slippageButtons.buttons.map((slippageValue, valnum) => {
            return (
              <button
                key={`${valnum}-${slippageValue}`}
                type="button"
                className={`slippage-button${!costumTolerance && !inputSlippageFocus && slippageValue === slippageTolerance ? " selected" : ""}`}
                onClick={() => slippageBtnHandler(slippageValue)}>
                <span>{slippageValue}%</span>
              </button>
            );
          })}

        <div className={`input-container${((slippageTolerance && !isFixedTolerance) || costumTolerance || inputSlippageFocus) ? " selected" : ""}`}>
          <input type="text"
            placeholder="Custom"
            name="slippage-input"
            autoComplete="off"
            className="slippage-input"
            value={slippageTolerance && isFixedTolerance ? costumTolerance : slippageTolerance}
            onChange={customSlippageInput}
            onFocus={() => setInputSlippageFocus(true)}
            onBlur={() => setInputSlippageFocus(false)}
          />
          <span className="slippage-sign">%</span>
        </div>
      </div>
      {slippageTolerance && ((Number(slippageTolerance) < 0.5)) &&
        <span className="slippage-error">
          <b>Pay Attention:</b> Your transaction may fail
        </span>
      }
    </div>
  );
};

export default Slippage;
