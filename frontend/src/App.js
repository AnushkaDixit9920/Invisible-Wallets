import { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import walletBg from "./assets/wallet-bg.jpg"; 

const contractAddress = "0xa9B82A271A5cc0A36b4a688B2642a71F73081594";

function App() {
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [adminStatus, setAdminStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const switchToSepolia = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return {
      contract: new ethers.Contract(contractAddress, abi, signer),
      signer,
    };
  };

  const connectWallet = async () => {
    try {
      setStatus("Connecting wallet...");
      await switchToSepolia();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setStatus("Wallet connected on Sepolia ✅");
    } catch {
      setStatus("Wallet connection failed ❌");
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);
      setStatus("Creating wallet...");
      const { contract } = await getContract();
      const tx = await contract.createUser();
      await tx.wait();
      setStatus("Wallet created successfully 🎉");
    } catch {
      setStatus("User already exists ❌");
    }
    setLoading(false);
  };

  const checkStatus = async () => {
    try {
      const { contract, signer } = await getContract();
      const addr = await signer.getAddress();
      setVerified(await contract.isUserVerified(addr));
      setReputation((await contract.getReputation(addr)).toString());
      setStatus("User data fetched ✅");
    } catch {
      setStatus("Failed to fetch data ❌");
    }
  };

  const verifyMe = async () => {
    try {
      setAdminStatus("Verifying user...");
      const { contract, signer } = await getContract();
      const addr = await signer.getAddress();
      const tx = await contract.verifyUser(addr);
      await tx.wait();
      setAdminStatus("User verified ✅");
    } catch {
      setAdminStatus("Only admin can verify ❌");
    }
  };

  const increaseMyReputation = async () => {
    try {
      setAdminStatus("Increasing reputation...");
      const { contract, signer } = await getContract();
      const addr = await signer.getAddress();
      const tx = await contract.increaseReputation(addr);
      await tx.wait();
      setAdminStatus("Reputation increased ⭐");
    } catch {
      setAdminStatus("Only admin can increase reputation ❌");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>💳 Invisible Wallet</h1>
        <p style={styles.subtitle}>Secure • Decentralized • Trustless</p>

        <div style={styles.section}>
          <button style={styles.primaryBtn} onClick={connectWallet}>
            🔗 Connect Wallet
          </button>
          <button
            style={styles.primaryBtn}
            onClick={createUser}
            disabled={loading}
          >
            {loading ? "⏳ Processing..." : "➕ Create Wallet"}
          </button>
        </div>

        <div style={styles.section}>
          <button style={styles.secondaryBtn} onClick={checkStatus}>
            📊 Check My Status
          </button>

          {verified !== null && (
            <p>
              🛡 Verified:{" "}
              <span style={verified ? styles.yes : styles.no}>
                {verified ? "YES" : "NO"}
              </span>
            </p>
          )}

          {reputation !== null && <p>⭐ Reputation: {reputation}</p>}
        </div>

        <div style={styles.section}>
          <h3 style={{ marginBottom: "10px" }}>🔑 Admin Actions</h3>
          <button style={styles.adminBtn} onClick={verifyMe}>
            ✅ Verify User
          </button>
          <button style={styles.adminBtn} onClick={increaseMyReputation}>
            ⭐ Increase Reputation
          </button>
          {adminStatus && <p>{adminStatus}</p>}
        </div>

        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: `linear-gradient(
      rgba(2, 6, 23, 0.85),
      rgba(2, 6, 23, 0.85)
    ), url(${walletBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },
  card: {
    background: "rgba(15, 23, 42, 0.92)",
    backdropFilter: "blur(14px)",
    padding: "32px",
    width: "380px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    textAlign: "center",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    marginBottom: "6px",
    color: "#38bdf8",
  },
  subtitle: {
    fontSize: "13px",
    opacity: 0.7,
    marginBottom: "22px",
  },
  section: {
    marginBottom: "22px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  secondaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#020617",
    color: "#e5e7eb",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    cursor: "pointer",
  },
  adminBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    background: "#16a34a",
    color: "#022c22",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  status: {
    marginTop: "18px",
    fontWeight: "600",
    color: "#38bdf8",
  },
  yes: { color: "#22c55e", fontWeight: "bold" },
  no: { color: "#ef4444", fontWeight: "bold" },
};

export default App;
