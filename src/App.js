import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState, useRef } from "react";
import { getWeb3 } from "./Utils/Web3.js";
import presaleArtifact from "./artifacts/contracts/Presale.sol/Presale.json";
import tokenArtifact from "./artifacts/contracts/MPARKToken.sol/MPARKToken.json";
import Web3 from "web3";
import * as ether_utils from "./ether-utils.json";
import * as errors from "./errors.json";

const mPARKToken="0x4631BCAbD6dF18D94796344963cB60d44a4136b6";
const presale="0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D"; 
function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [networkId, setNetworkId] = useState(undefined);
  const [error, setError] = useState(false);

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

        let contribution = await presaleContractInterface.methods.checkContribution(accounts[0]).call();
        console.log(contribution,"checkContribution");

        let balanceOfPresale = await tokenContractInterface.methods.balanceOf(accounts[0]).call();
        console.log(balanceOfPresale,"balanceOf");


        let blockTime = await presaleContractInterface.methods.getTimeStamp().call();
        let endTime = await presaleContractInterface.methods.getEndDate().call();
        console.log(blockTime,endTime,"blockTime and endtime");

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

  
  useEffect(() => {},[]);



  const buyTokens = async () => {
    let amount = web3.utils.toWei("0.1",'ether');
    await contract.methods.buyTokens(accounts[0]).send({from:accounts[0],value:amount});
  }

  const claimTokens= async () => {
    await contract.methods.claimTokens().send({from:accounts[0]});
  }



  return (
    <>
      <div> Presale MetaPark </div>
      <button onClick={()=> buyTokens()}>Buy Tokens</button>
      
      <button onClick={()=> claimTokens()}>Claim Tokens</button>
    </>
  );
}

export default App;
