import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import walletBg from "./assets/wallet-bg.jpg";

const contractAddress = "0xa9B82A271A5cc0A36b4a688B2642a71F73081594";
const BACKEND_URL = "https://invisible-wallets-backend.onrender.com";

function App() {
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [adminStatus, setAdminStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  /* ---------- AUTO-DETECT WALLET ---------- */
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStatus("Wallet already connected ✅");
        }
      });
    }
  }, []);

  /* ---------- CONTRACT ---------- */
  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  /* ---------- CONNECT WALLET ---------- */
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask not detected ❌");
      return;
    }

    try {
      setStatus("Requesting wallet access...");

      // 1️⃣ Request accounts (THIS triggers MetaMask popup)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      setWalletAddress(address);

      // 2️⃣ Switch to Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch {
        setStatus("Please switch to Sepolia network ❌");
        return;
      }

      // 3️⃣ Store wallet in backend
      await fetch(`${BACKEND_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          name: "Demo User",
        }),
      });

      setStatus("Wallet connected successfully ✅");
    } catch (err) {
      setStatus("User rejected wallet connection ❌");
      console.error(err);
    }
  };

  /* ---------- CREATE USER ---------- */
  const createUser = async () => {
    try {
      setLoading(true);
      setStatus("Creating on-chain identity...");
      const contract = await getContract();
      const tx = await contract.createUser();
      await tx.wait();
      setStatus("Wallet created successfully 🎉");
    } catch {
      setStatus("User already exists ❌");
    }
    setLoading(false);
  };

  /* ---------- CHECK STATUS ---------- */
  const checkStatus = async () => {
    try {
      const contract = await getContract();
      const addr = await contract.runner.getAddress();
      setVerified(await contract.isUserVerified(addr));
      setReputation((await contract.getReputation(addr)).toString());
      setStatus("User data fetched ✅");
    } catch {
      setStatus("Failed to fetch data ❌");
    }
  };

  /* ---------- ADMIN ACTIONS ---------- */
  const verifyMe = async () => {
    try {
      setAdminStatus("Verifying user...");
      const contract = await getContract();
      const addr = await contract.runner.getAddress();
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
      const contract = await getContract();
      const addr = await contract.runner.getAddress();
      const tx = await contract.increaseReputation(addr);
      await tx.wait();
      setAdminStatus("Reputation increased ⭐");
    } catch {
      setAdminStatus("Only admin can increase reputation ❌");
    }
  };

  /* ---------- UI ---------- */
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
            disabled={loading || !walletAddress}
          >
            {loading ? "⏳ Processing..." : "➕ Create Wallet"}
          </button>
        </div>

        <div style={styles.section}>
          <button
            style={styles.secondaryBtn}
            onClick={checkStatus}
            disabled={!walletAddress}
          >
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
          <h3>🔑 Admin Actions</h3>
          <button
            style={styles.adminBtn}
            onClick={verifyMe}
            disabled={!walletAddress}
          >
            ✅ Verify User
          </button>
          <button
            style={styles.adminBtn}
            onClick={increaseMyReputation}
            disabled={!walletAddress}
          >
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },
  card: {
    background: "rgba(15, 23, 42, 0.92)",
    padding: "32px",
    width: "380px",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    textAlign: "center",
    color: "#e5e7eb",
  },
  title: { color: "#38bdf8" },
  subtitle: { fontSize: "13px", opacity: 0.7, marginBottom: "22px" },
  section: { marginBottom: "20px" },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    width: "100%",
    padding: "12px",
    background: "#020617",
    color: "#e5e7eb",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
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
    fontWeight: "600",
  },
  status: { marginTop: "14px", fontWeight: "600", color: "#38bdf8" },
  yes: { color: "#22c55e", fontWeight: "bold" },
  no: { color: "#ef4444", fontWeight: "bold" },
};

export default App;
