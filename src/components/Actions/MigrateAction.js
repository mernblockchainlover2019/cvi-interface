import React, { useMemo } from "react";
import Button from "components/Elements/Button";
import { useDispatch } from "react-redux";
import { setMigrationModalOpen } from "store/actions";

const MigrateAction = ({ tokenName }) => {
  const dispatch = useDispatch();
 
  return useMemo(() => {
    return <> 
        <div className="migrate-component">
          <div className="migrate-component__container">
            {(tokenName === "cvi-usdt-lp" || tokenName === "usdt") && <Button
              className="migrate-component__container--button"
              buttonText="Migrate"
              onClick={() => dispatch(setMigrationModalOpen(true))} 
            />}
          </div>
        </div>
    </>
  }, [dispatch, tokenName]);
};

export default MigrateAction;
