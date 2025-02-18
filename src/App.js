import { useState, useEffect } from "react";
import { ethers } from 'ethers'

import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json"


const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [rankings, setRankings] = useState([]);


  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        console.log("Rede conectada:", network);
        await provider.send("eth_requestAccounts", []);

        try {
          const signer = await provider.getSigner();
          setAccount(await signer.getAddress());
          console.log("Conta conectada:", await signer.getAddress());

          console.log("abi:", TokenArtifact.abi);

          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, TokenArtifact.abi, signer);
          setContract(contractInstance);

          fetchRankings(contractInstance);
          console.log("Contrato carregado:", contractInstance);

          const balance = await provider.getBalance("ethers.eth")
          console.log("Saldo:", ethers.utils.formatEther(balance));
          //console.log("Saldo:", await contractInstance.balanceOf(signer.getAddress()));

        } catch (error) {
          console.error("Erro ao conectar à MetaMask", error);
        }
      } else {
        alert("MetaMask não detectado");
      }
    }
    loadBlockchainData();
  }, []);

  async function fetchRankings(contractInstance) {
    try {
      const [names, amounts] = await contractInstance.getRanking(); // Certifique-se de desestruturar os valores
      console.log("Nomes:", names);
      console.log("Quantidades:", amounts);
      setRankings({ names, amounts });
    } catch (error) {
      console.error("Erro ao buscar rankings", error);
    }
  }

  async function callFunction(funcName, ...args) {
    if (!contract) return;
    try {
      const tx = await contract[funcName](...args);
      await tx.wait();
      console.log("Transação confirmada:", tx);
      fetchRankings(contract);
    } catch (error) {
      console.error("Erro ao chamar função", error);
    }
  }



  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">DApp com MetaMask</h1>
      <p>Conta conectada: {account}</p>
      <button
        onClick={() => callFunction("issueToken")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        issueToken
      </button>
      <h2 className="mt-5 text-lg font-bold">Ranking</h2>
      <ul>
        {rankings.map((rank, index) => (
          <li key={index}>{rank}</li>
        ))}
      </ul>
    </div>
  );
}