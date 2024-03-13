import React from 'react';
import Container from 'components/Layout/Container';
import Button from 'components/Elements/Button';

import './HelperComponents.scss';

//TODO: better styling of error component
export const Error = ({message}) => {
  <Container title="Error occured" className='cvi-index-error'>
    {message}
  </Container>
};

export const RangeSelector = ({ ranges, activeRange, onClick }) => {
  return (
    <div className='cvi-index-range-selector'>  
      {ranges.map((item) => {
        return(<Button className={`${item===activeRange? 'range-item active' : 'range-item'}`} key={'range-item_' + item} onClick={() => onClick(item)}>
          {item}
        </Button>);
      })}
    </div>
  );
}

//TODO: better styling of loading component
export const Loading = () => <Container>Loading...</Container>;
