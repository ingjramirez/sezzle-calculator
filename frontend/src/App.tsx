import Calculator from './components/Calculator';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e]">
      <h1 className="text-[#a1a1a6] text-sm font-medium tracking-widest uppercase mb-6">
        Sezzle Calculator
      </h1>
      <Calculator />
    </div>
  );
}

export default App;
