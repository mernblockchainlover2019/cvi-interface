import React from "react";

const PaginatorPages = ({
  currentPage,
  lastPage,
  numOfpageBtndsToDispay = 10,
  onPageClick
}) => {
  const first =
    currentPage % numOfpageBtndsToDispay
      ? parseInt(currentPage / numOfpageBtndsToDispay, 10) *
          numOfpageBtndsToDispay +
        1
      : currentPage - numOfpageBtndsToDispay + 1;
  const lst = first + numOfpageBtndsToDispay - 1;
  const last = lst > lastPage ? lastPage : lst;
  const buttons = new Array(((last - first) < 0 ? 0 : (last - first)) + 1);
  for (let i = first; i <= last; i++) {
    buttons[i - 1] = i;
  }
  return (
    <span className="page-buttons-list">
      {buttons.map(btn => (
        <button
          key={btn}
          className={`${currentPage === btn ? "current" : ""}`}
          onClick={() => onPageClick(btn)}
        >
          {btn}
        </button>
      ))}
    </span>
  );
};

export default PaginatorPages;
