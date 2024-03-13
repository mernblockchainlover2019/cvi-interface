import { useIsTablet } from "components/Hooks";
import Tooltip from "components/Tooltip";

const RowItem = ({token, type, header, content, tooltip, hide, isTable}) => {
  const isTablet = useIsTablet();
  if(hide) return (!isTablet || isTable) ? <td></td> : <div></div>;
  return (!isTablet || isTable) ? <td className={`${token ? `row-item-component--${token}` : ''} ${type ?? ''}`}>
    {header && isTable && <RowHeader header={header} tooltip={tooltip} /> }
    {content}
  </td> : <div className={`row-item-component ${type ?? ''}`}>
    {!hide && <> 
      {header && isTablet && <span className="row-item-component--title">
        {header} 
        {tooltip && <Tooltip 
          type="question" 
          left={tooltip?.left ?? -30} 
          mobileLeft={tooltip?.mobileLeft} 
          maxWidth={400} 
          minWidth={250} 
          content={tooltip?.content} />}
      </span>}
      {content}
    </>}
  </div>
}

const RowHeader = ({header, tooltip}) => {
  return <span className="row-item-component--title">
      {header} 
      {tooltip && <Tooltip 
        type="question" 
        left={tooltip?.left ?? -30} 
        mobileLeft={tooltip?.mobileLeft} 
        maxWidth={400} 
        minWidth={250} 
        content={tooltip?.content} 
      />}
  </span>
}

export default RowItem;