import React from "react";
import "./Paginator.scss";
import PaginatorPages from "./PagniatorPages";

const Paginator = ({
  currentPage,
  totalRecords,
  onBackClick,
  onFwdClick,
  pgSize,
  onLastClick,
  onFirstClick,
  onPageClick,
  numOfpageBtndsToDispay
}) => {
  if (!totalRecords || totalRecords <= pgSize) {
    return null;
  }
  const lastPage = Math.ceil(totalRecords / pgSize);

  return (
    <div className="paginator">
      <button disabled={currentPage === 1} onClick={onFirstClick}>
        <img src={require('../../images/icons/double-left-chevron.svg').default} alt="double chevron left" /> first
      </button>
      <button disabled={currentPage === 1} onClick={onBackClick}>
        <img src={require('../../images/icons/left-chevron.svg').default} alt="chevron left" /> previous
      </button>
      <PaginatorPages
        currentPage={currentPage}
        numOfpageBtndsToDispay={numOfpageBtndsToDispay}
        lastPage={lastPage}
        onPageClick={page => onPageClick(page)}
      />
      <span className="page-of-total">
        {((currentPage - 1) * pgSize)+1}-{currentPage * pgSize > totalRecords ? totalRecords : currentPage * pgSize} of {totalRecords} actions
      </span>
      <button disabled={currentPage === lastPage} onClick={onFwdClick}>
        next <img src={require('../../images/icons/right-chevron.svg').default} alt="chevron right" />
      </button>
      <button disabled={currentPage === lastPage} onClick={() => onLastClick(lastPage)}>
        last <img src={require('../../images/icons/double-right-chevron.svg').default} alt="double chevron right" />
      </button>
    </div>
  );
};

export default Paginator;