import { useState, useEffect } from "react";
import { ethers } from 'ethers'

import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json"


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//const localBlockchainAddress = 'http://localhost:8545'

export default function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        try {
          const signer = await provider.getSigner();
          setAccount(await signer.getAddress());
          console.log("Conta conectada:", await signer.getAddress());

          console.log("abi:", TokenArtifact.abi);

          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, TokenArtifact.abi, signer);
          console.log("Contrato carregado:", contractInstance);

          await setContract(contractInstance);

          await fetchRankings(contractInstance);
          await createEvent(contractInstance);

        } catch (error) {
          console.error("Erro ao conectar à MetaMask", error);
        }
      } else {
        alert("MetaMask não detectado");
      }
    }
    loadBlockchainData();
  }, []);

  async function createEvent(contractInstance){
    contractInstance.on( "Deposit", async(username, newAmount) =>{
      setRankings(prevRankings => {
        return prevRankings.map(user => {
          if (user.name === username) {
            return { ...user, amount: ethers.utils.formatEther(newAmount) };
          }
          return user;
        });
      });
    }
    )
  }

  async function fetchRankings(contractInstance) {
    try {
      const [names, amounts] = await contractInstance.getRanking();
      
      const rankings = names.map((name, index) => ({
        name: name,
        amount: amounts[index]
      }));

      console.log("Rankings:", rankings);
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

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  }


  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">DApp com MetaMask</h1>
      <p>Conta conectada: {account}</p>

      <label className="mt-5 block text-lg font-bold">Selecione uma :</label>
      <select 
        onChange={handleNameChange}
        value={selectedName}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
         <option value="">Selecione...</option>
        {rankings.map(({ name }, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </select>
      <label className="mt-5 block text-lg font-bold">Digite o valor (em ETH):</label>
      <input
        type="text"
        value={amount}
        onChange={handleAmountChange}
        className="bg-white border-2 border-gray-300 rounded px-4 py-2 mt-2"
        placeholder="Digite o valor..."
      />
      <button
        onClick={() => {
          console.log(selectedName,amount)
          callFunction("issueToken",selectedName,amount)}
        }
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        issueToken
      </button>
      <button
        onClick={() => callFunction("issueToken")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Votar
      </button>
      <button
        onClick={() => callFunction("vote", selectedName, amount)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Ativar Votação
      </button>
      <button
        onClick={() => callFunction("votingOff")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Desativar Votação
      </button>
      <h2 className="mt-5 text-lg font-bold">Ranking</h2>
      <ul>
        {rankings.map(({ name, amount }, index) => (
          <li key={index}>{name}: {amount} ETH</li>
        ))}
      </ul>
    </div>


  );
}