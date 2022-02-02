import React, { useState, createContext, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TransactionModal from "./TransactionModal";
import ConnectWalletModal from "./ConnectWalletModal";
import Pact from "pact-lang-api";

export const PactContext = createContext();
export const DEFAULT_GAS_PRICE = 0.00000001;
export const MAIN_NET_ID = "mainnet01";
export const TEST_NET_ID = "testnet04";

const LOCAL_ACCOUNT_KEY = "LOCAL_ACCOUNT_KEY";

const POLL_INTERVAL_S = 5;

export const PactContextProvider = ({ children }) => {
  const [chainId, setChainId] = useState(null);
  const [gasPrice, setGasPrice] = useState(DEFAULT_GAS_PRICE);
  const [netId, setNetId] = useState(null);
  const [account, setAccount] = useState(() => tryLoadLocalAccount());
  const [networkUrl, setNetworkUrl] = useState(null);
  const [currTransactionState, setCurrTransactionState] = useState({});
  const [isConnectWallet, setIsConnectWallet] = useState(false);

  /* HELPER HOOKS */
  useEffect(() => {
    setNetworkUrl(getNetworkUrl(netId, chainId));
  }, [netId, chainId]);

  const setNetworkSettings = (netId, chainId, gasPrice) => {
    setNetId(netId);
    setChainId(chainId);
    setGasPrice(gasPrice);
  };

  const useSetNetworkSettings = (
    netId,
    chainId,
    gasPrice = DEFAULT_GAS_PRICE
  ) => {
    useEffect(() => {
      setNetworkSettings(netId, chainId, gasPrice);
    }, [netId, chainId, gasPrice]);
  };

  const sendTransaction = async (
    cmd,
    previewComponent = null,
    transactionMessage = null,
    successCallback = () => {}
  ) => {
    setCurrTransactionState({
      transactionMessage,
      successCallback,
      cmdToConfirm: cmd,
      previewComponent,
    });
  };

  const signTransaction = async (cmdToSign) => {
    updateTransactionState({ signingCmd: cmdToSign });
    const signedCmd = await Pact.wallet.sign(cmdToSign);
    updateTransactionState({ signedCmd });
    let localRes = await fetch(`${networkUrl}/api/v1/local`, mkReq(signedCmd));
    const parsedLocalRes = await parseRes(localRes);
    if (parsedLocalRes?.result?.status === "success") {
      const data = await Pact.wallet.sendSigned(signedCmd, networkUrl);
      const requestKey = data.requestKeys[0];
      updateTransactionState({
        sentCmd: signedCmd,
        requestKey,
      });
      clearTransaction();
      await pollForTransaction(requestKey);
    } else {
      toast.error(`Couldn't submit transaction`, {
        hideProgressBar: true,
      });
      clearTransaction();
    }
  };

  const clearTransaction = () => {
    setCurrTransactionState({});
  };

  const openConnectWallet = async (account) => {
    setIsConnectWallet(true);
  };

  const setConnectedWallet = async (account) => {
    if (account != null) {
      setAccount(account);
      toast.success(`Connected ${account.account.slice(0, 10)}...`, {
        hideProgressBar: true,
        autoClose: 2000,
      });
      trySaveLocalAccount(account);
    } else {
      toast.error(`Couldn't connect account :(`, {
        hideProgressBar: true,
      });
      setAccount({ account: null, guard: null, balance: 0 });
    }
    closeConnectWallet();
  };

  const closeConnectWallet = () => {
    setIsConnectWallet(false);
  };

  const logoutAccount = () => {
    trySaveLocalAccount(null);
    setAccount(null);
    setIsConnectWallet(false);
  };

  const fetchAccountDetails = async (accountName) => {
    // Try see if the account on the current chain has any coins
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `(coin.details ${JSON.stringify(accountName)})`,
          meta: Pact.lang.mkMeta(
            "",
            chainId,
            gasPrice,
            3000,
            creationTime(),
            600
          ),
        },
        networkUrl
      );
      if (data.result.status === "success") {
        return data.result.data;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  };

  const updateTransactionState = (newParams) => {
    const { transactionMessage, successCallback } = { currTransactionState };
    setCurrTransactionState({ transactionMessage, successCallback, newParams });
  };

  const pollForTransaction = async (requestKey) => {
    let time_spent_polling_s = 0;
    let pollRes = null;
    const { transactionMessage } = currTransactionState;
    let waitingText = `Waiting ${POLL_INTERVAL_S}s for transaction ${requestKey.slice(
      0,
      10
    )}... (${transactionMessage})`;
    toast.info(waitingText, {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      autoClose: false,
      toastId: requestKey,
    });
    while (time_spent_polling_s < 240) {
      await wait(POLL_INTERVAL_S * 1000);
      pollRes = await Pact.fetch.poll(
        { requestKeys: [requestKey] },
        networkUrl
      );
      if (Object.keys(pollRes).length !== 0) {
        break;
      }
      time_spent_polling_s += POLL_INTERVAL_S;
      waitingText = `Waiting ${
        time_spent_polling_s + POLL_INTERVAL_S
      }s for transaction ${requestKey.slice(0, 10)}... (${transactionMessage})`;
      toast.update(requestKey, { render: waitingText });
    }

    if (pollRes[requestKey].result.status === "success") {
      toast.update(requestKey, {
        render: `Succesfully completed ${requestKey.slice(
          0,
          10
        )}... (${transactionMessage})`,
        type: "success",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
      });
      if (currTransactionState?.successCallback != null) {
        currTransactionState.successCallback();
      }
    } else {
      toast.error(
        `Failed transaction ${requestKey}... (${transactionMessage})`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
        }
      );
    }
    clearTransaction();
  };

  return (
    <PactContext.Provider
      value={{
        useSetNetworkSettings,
        setNetworkSettings,
        sendTransaction,
        openConnectWallet,
        setConnectedWallet,
        closeConnectWallet,
        logoutAccount,
        signTransaction,
        clearTransaction,
        fetchAccountDetails,
        currTransactionState,
        account,
        netId,
        chainId,
      }}
    >
      <ToastContainer
        position="top-right"
        theme="dark"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ConnectWalletModal
        open={isConnectWallet}
        onCancel={() => setIsConnectWallet(false)}
      />
      <TransactionModal />
      {children}
    </PactContext.Provider>
  );
};

/* Non hook based helper function */
function getNetworkUrl(netId, chainId) {
  if (netId == null && chainId == null) {
    return;
  }
  if (netId === TEST_NET_ID) {
    return `https://api.testnet.chainweb.com/chainweb/0.0/${TEST_NET_ID}/chain/${chainId}/pact`;
  } else if (netId === MAIN_NET_ID) {
    return `https://api.chainweb.com/chainweb/0.0/${MAIN_NET_ID}/chain/${chainId}/pact`;
  }
  throw new Error("networkId must be testnet or mainnet");
}

function creationTime() {
  return Math.round(new Date().getTime() / 1000) - 10;
}

function mkReq(cmd) {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(cmd),
  };
}

async function parseRes(raw) {
  const rawRes = await raw;
  const res = await rawRes;
  if (res.ok) {
    const resJSON = await rawRes.json();
    return resJSON;
  } else {
    const resTEXT = await rawRes.text();
    return resTEXT;
  }
}

const wait = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function tryLoadLocalAccount() {
  let account = localStorage.getItem(LOCAL_ACCOUNT_KEY);
  if (account == null) {
    return null;
  }
  try {
    return JSON.parse(account);
  } catch (e) {
    console.log(e);
    return null;
  }
}

function trySaveLocalAccount(account) {
  try {
    localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
  } catch (e) {
    console.log(e);
    return;
  }
}
