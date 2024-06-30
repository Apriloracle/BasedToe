import Image from "next/image";
import thirdwebIcon from "@public/thirdweb.svg";
import WalletFuncs from "@/components/WalletFuncs";
import Attest from "@/components/Attest";
import TicTacToe from "@/components/TicTacToe";

export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-xl mx-auto">
      <div className="py-20 w-full">
        <Header />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <WalletFuncs />
            <Attest />
          </div>
          <div className="w-full md:w-1/3">
            <TicTacToe />
          </div>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
        }}
      />
    </header>
  );
}
