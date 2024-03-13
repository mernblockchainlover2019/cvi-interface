import React, { useState, useEffect } from "react";
import "./TotalValueLocked.scss";
import Tooltip from "components/Tooltip";
import { commaFormatted, customFixed, toDisplayAmount } from "../../utils";
import Api from "../../Api";
import Spinner from 'components/Spinner/Spinner';

const TotalValueLocked = ({ placement }) => {
  const [tvlValue, setTvlValue] = useState(null);

  useEffect(() => {
    fetchTVL();
    return () => {
      setTvlValue();
    };
  }, []);

  async function fetchTVL() {
    try {
      const response = await Api.GET_TVL();
      const tvlAll = response.data.allTVL;
      setTvlValue(tvlAll);
    } catch (err) {
      console.log("Error in fetchTVL", err);
    }
  }

  const tvl = {
    headline: "Total value locked",
    shortHeadline: "TVL",
    value: tvlValue ? tvlValue : null,
    tooltip: {
      content:
        "Total value locked is the total value of the open positions, liquidity, staked GOVI and LP tokens on Ethereum, Polygon and Arbitrum networks",
      mobileLeft: 0,
      left: 0,
    },
  };

  return (
    <div className={`total-value-locked ${placement}`}>
      <h2>
        {placement === "navitem" ? tvl.shortHeadline : tvl.headline}
        {tvl.tooltip && placement !== "home" && (
          <Tooltip
            type="question"
            left={tvl.tooltip?.left ?? -30}
            mobileLeft={tvl.tooltip?.mobileLeft}
            maxWidth={"fit-content"}
            minWidth={250}
            content={tvl.tooltip?.content}
          />
        )}
      </h2>
      <div className="tvl-value bold green">
      {
        tvl.value === null ? <Spinner className="spinner statistics-spinner"/>
            : `$${commaFormatted(customFixed(toDisplayAmount(tvl.value, 6), 2))}`
      }
    </div>
    </div>
  );
};

export default TotalValueLocked;
