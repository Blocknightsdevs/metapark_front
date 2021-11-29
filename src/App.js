import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState, useRef } from "react";
import { getWeb3 } from "./Utils/Web3.js";
import presaleArtifact from "./artifacts/contracts/Presale.sol/Presale.json";
import tokenArtifact from "./artifacts/contracts/MPARKToken.sol/MPARKToken.json";
import Web3 from "web3";
import * as ether_utils from "./ether-utils.json";
import * as errors from "./errors.json";

const mPARKToken="0x4b6aB5F819A515382B0dEB6935D793817bB4af28";
const presale="0xCace1b78160AE76398F486c8a18044da0d66d86D";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [networkId, setNetworkId] = useState(undefined);
  const [error, setError] = useState(false);
  const [endTime, setEndTime] = useState("");
  const [presaleEnded, setPresaleEnded] = useState(true);

  function checkNewtwork(networkId) {
    //check network
    console.log(networkId);
    if (ether_utils.NETWORK_ID.LOCALHARDHAT != networkId) {
      throw errors.ERROR_WRONG_NETWORK;
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        const networkId = await web3.eth.net.getId();

        setNetworkId(networkId);
        checkNewtwork(networkId);
        let presaleContractInterface = new web3.eth.Contract(
          presaleArtifact.abi,
          presale
        );
        let tokenContractInterface = new web3.eth.Contract(
          tokenArtifact.abi,
          mPARKToken
        );

        let contribution = await presaleContractInterface.methods
          .checkContribution(accounts[0])
          .call();
        console.log(contribution, "checkContribution");

        let balanceOfPresale = await tokenContractInterface.methods
          .balanceOf(accounts[0])
          .call();
        console.log(balanceOfPresale, "balanceOf");

        let blockTime = await presaleContractInterface.methods
          .getTimeStamp()
          .call();
        let endTime = await presaleContractInterface.methods
          .getEndDate()
          .call();
        //console.log(blockTime,endTime,"blockTime and endtime");
        getTimestapedDates(endTime);

        setContract(presaleContractInterface);
        setWeb3(web3);
      } catch (e) {
        console.log(e);
        setError(e);
        setLoading(false);
      }
    };

    init();

    //changed account
    if (web3) {
      console.log("accounts changed");
      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("changed", accounts);
        if (accounts.length == 0) {
          window.location.reload();
        }
        setAccounts(accounts);
      });

      //changed network
      window.ethereum.on("chainChanged", () => {
        console.log("chainChanged");
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {}, [endTime]);

  function getTimestapedDates(timestamp) {
    var d1 = new Date();
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime =
      date.toDateString() +
      ", " +
      hours +
      ":" +
      minutes.substr(-2) +
      ":" +
      seconds.substr(-2);

    if (d1 > date) {
      setPresaleEnded(true);
    } else {
      setPresaleEnded(false);
      setEndTime(formattedTime);
    }
  }

  const buyTokens = async () => {
    let amount = web3.utils.toWei("0.1", "ether");
    await contract.methods
      .buyTokens(accounts[0])
      .send({ from: accounts[0], value: amount });
  };

  const claimTokens = async () => {
    await contract.methods.claimTokens().send({ from: accounts[0] });
  };

  return (
    <>
      <div> Presale MetaPark </div>
      
      <div>{presaleEnded ? <p>Presale ended</p> : <p>End time {endTime}</p>}</div>
      {!presaleEnded && <button onClick={() => buyTokens()}>Buy Tokens</button> }
      <button onClick={() => claimTokens()}>Claim Tokens</button>
    </>
  );
}

export default App;
