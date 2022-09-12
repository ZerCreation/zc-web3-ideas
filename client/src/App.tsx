import "./App.css";
import AccountInfo from "./components/AccountInfo";
import IdeasList from "./components/IdeasList";

function App() {
  const contentStyle = {
    marginTop: '5%',
    display: 'flex',
    flexDirection: 'column'
  } as const;

  return (
    <div className="App">
      <AccountInfo />
      <div style={contentStyle}>
        Web3 Ideas for Zer Creation
        <IdeasList />
      </div>
    </div>
  );
}

export default App;
