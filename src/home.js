import { useState, useEffect } from "react";
import Web3 from "web3";

const CONTRACT_ADDRESS = "SEU_CONTRATO_AQUI";
const CONTRACT_ABI = [ /* ABI do contrato */ ];

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);

          fetchRankings(contractInstance);
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
      const rankings = await contractInstance.methods.getRankings().call();
      setRankings(rankings);
    } catch (error) {
      console.error("Erro ao buscar rankings", error);
    }
  }

  async function callFunction(funcName, ...args) {
    if (!contract) return;
    try {
      const result = await contract.methods[funcName](...args).send({ from: account });
      console.log("Resultado:", result);
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
        onClick={() => callFunction("someFunction")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Chamar Função
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
