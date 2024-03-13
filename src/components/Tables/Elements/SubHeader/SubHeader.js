import { useIsTablet } from "components/Hooks";
import { useMemo } from "react";
import './SubHeader.scss';

const SubHeader = ({title}) => {
    const isTablet = useIsTablet();

    return useMemo(() => {
        return !isTablet ? <tr className="sub-header-component">
            <td>{title}</td>
        </tr> : <div className="sub-header-component">
            <span>{title}</span>
        </div>
        //eslint-disable-next-line
    }, [isTablet]) 
}

export default SubHeader;