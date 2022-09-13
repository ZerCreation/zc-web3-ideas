import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import AccountInfo from "./components/AccountInfo";
import IdeasList from "./components/IdeasList";
import ListActions from "./components/ListActions";
import WEB3IDEAS from "./contracts/Web3Ideas.json";

declare let window: any;

function App() {
  const contentStyle = {
    marginTop: '5%',
    display: 'flex',
    flexDirection: 'column'
  } as const;

  const contractAddress = '0x69fD8ECcA1e838E12e78e94c19bA8c91cd6A85D3';

  type Web3Provider = ethers.providers.Web3Provider;
  const [provider, setProvider] = useState<Web3Provider>();
  const [contractSigner, setContractSigner] = useState<ethers.Contract>();
  const [address, setAddress] = useState('');

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, []);

  useEffect(() => {
    if (provider !== undefined) {
      setContractSigner(new ethers.Contract(contractAddress, WEB3IDEAS.abi, provider.getSigner()));
    }
  }, [provider]);

  async function onConnectCallback(address: string) {
    if (provider === undefined) return;
    setAddress(address);
  }

  return (
    <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <div className="App">
      <AccountInfo provider={provider} connectCallback={onConnectCallback} />
      <div style={contentStyle}>
        Web3 Ideas for Zer Creation
        <IdeasList contractSigner={contractSigner} provider={provider} address={address} />
        <ListActions contractSigner={contractSigner} address={address} />
      </div>
    </div>
  </ThemeProvider>
  );
}

export default App;
