import { createContext } from 'react';
import { useContracts } from './useContracts';
export const contractsContext = createContext(null);

export const ContractsContext = ({children}) => {
  const contracts = useContracts();

  return <contractsContext.Provider value={contracts}>
    {children}
  </contractsContext.Provider>
}
