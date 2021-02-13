import { useStore } from "./store";

export const useStoreApi = () => {
  const { state, dispatch } = useStore();

  return {
    balance: state.balance,
    address: state.address,
    message: state.message,
    setAddress: newAddress => {
      dispatch({
        type: "NEW-ADDRESS",
        address: newAddress,
        message: "New address added successfully!"
      });
    },
    setBalance: newBalance => {
      dispatch({
        type: "SET-BALANCE",
        balance: newBalance
      });
    }
  };
};
