import { useState, useEffect } from "react";
import { ethers } from 'ethers'

import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json"


const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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

  async function createEvent(contractInstance) {
    contractInstance.on("Deposit", async (username, newAmount) => {
      const [names, amounts] = await contractInstance.getRanking();
      const newRankings = names.map((name, index) => ({
        name: name,
        amount: amounts[index].toString()
      }));
  
      // Verifica se os rankings mudaram antes de atualizar o estado
      setRankings(prevRankings => {
        if (JSON.stringify(prevRankings) !== JSON.stringify(newRankings)) {
          return newRankings;
        }
        return prevRankings;
      });
    });
  }


  async function fetchRankings(contractInstance) {
    try {
      const [names, amounts] = await contractInstance.getRanking();

      const rankings = names.map((name, index) => ({
        name: name,
        amount: amounts[index].toString()
      }));

      rankings.sort((a, b) => b.amount - a.amount);

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
      await fetchRankings(contract);
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

      <label className="mt-5 block text-lg font-bold">Selecione uma conta:</label>
      <br />
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
      <br />

      <label className="mt-5 block text-lg font-bold">Digite o valor (em ETH):</label>
      <br />

      <input
        type="text"
        value={amount}
        onChange={handleAmountChange}
        className="bg-white border-2 border-gray-300 rounded px-4 py-2 mt-2"
        placeholder="Digite o valor..."
      />
      <br />

      <button
        onClick={() => {
          console.log(selectedName, amount)
          callFunction("issueToken", selectedName, ethers.utils.parseEther(amount))
        }
        }
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        issueToken
      </button>
      <br />
      <button
        onClick={() => {
          console.log(selectedName, amount)
          callFunction("vote", selectedName, ethers.utils.parseEther(amount))
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Votar
      </button>
      <br />
      <button
        onClick={() => {
          console.log(selectedName, amount)
          callFunction("voteOn")
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Ativar Votação
      </button>
      <br />

      <button
        onClick={() => callFunction("votingOff")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Desativar Votação
      </button>
      <br />

      <h2 className="mt-5 text-lg font-bold">Ranking</h2>
      <ul>
        {rankings.map(({ name, amount }, index) => (
          <li key={index}>
            {name}: {ethers.utils.formatEther(amount)} ETH
          </li>
        ))}
      </ul>
    </div>


  );
}