import { contractsContext } from "contracts/ContractContext";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { maxUint256, toBN } from "utils";
import Contract from "web3-eth-contract";
import { useActiveWeb3React } from "./wallet";
import { isGoviToken } from '../../utils';
import { getTransactionType } from "contracts/utils";

const useApproveToken = () => {
    const { account, library } = useActiveWeb3React();
    const contracts = useContext(contractsContext);
    const { selectedNetwork } = useSelector(({app})=>app);

    const getContract = (contractKey) => {
        const contractsJSON = require(`../../contracts/files/${process.env.REACT_APP_ENVIRONMENT}/Contracts_${selectedNetwork}.json`);
        const { abi, abiRef, address } = contractsJSON[contractKey];
        const _contract = new Contract(abi || contractsJSON[abiRef].abi, address);
        _contract.setProvider(library?.currentProvider);
        return _contract
    }

    const allowance = async (token, address) => {
        if(!account) return;
        const _contract = getContract(isGoviToken(token.key) ? token.rel.contractKey : token.rel.platform ?? token.rel.token);
        return await _contract.methods.allowance(account, address).call();
    }
    
    const approve = async (token, address) => {
        if(!account) return;
        const _contract = getContract(isGoviToken(token.key) ? token.rel.contractKey : token.rel.platform ?? token.rel.token)
        return await _contract.methods.approve(address, maxUint256).send({from: account, ...getTransactionType(selectedNetwork)});
    }

    const hasAllowance = async (token) => {
        const { _address: address } = contracts[token.rel.stakingRewards];
        const approvalValue = await allowance(token, address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(toBN(0));
        return compareApprovalWithAmount === 1
    }

    const approvalValidation = async (token) => {
        const { _address: address } = contracts[token.rel.stakingRewards];
        const approvalValue = await allowance(token, address);
        const compareApprovalWithAmount = toBN(approvalValue).cmp(toBN(0));
        
        if(compareApprovalWithAmount !== 1){
            const allowanceRes = await approve(token, address);
            if(!allowanceRes.status) return false;
        }
        
        return true
    }
    return { hasAllowance, approvalValidation }
}

export default useApproveToken;