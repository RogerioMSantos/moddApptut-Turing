import { useState, useEffect } from "react";
import { ethers } from 'ethers'

import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json"


const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const localBlockchainAddress = 'http://localhost:8545'

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);


  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.JsonRpcProvider(localBlockchainAddress);
        try {
          const signer = await provider.getSigner();
          setAccount(await signer.getAddress());

          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, TokenArtifact.abi, signer);
          setContract(contractInstance);

          fetchRankings(contractInstance);
          fetchAuthorizedUsers(contractInstance);

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
      const rankings = await contractInstance.getRankings();
      setRankings(rankings);
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

  async function fetchAuthorizedUsers(contractInstance) {
    try {
      const users = await contractInstance.getAuthorizedUsers();
      setAuthorizedUsers(users);
    } catch (error) {
      console.error("Erro ao buscar usuários autorizados", error);
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
      <h2 className="mt-5 text-lg font-bold">Usuários Autorizados</h2>
      <ul>
        {authorizedUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>

    </div>
  );
}