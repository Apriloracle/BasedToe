import Image from "next/image";
import thirdwebIcon from "@public/thirdweb.svg";
import WalletFuncs from "@/components/WalletFuncs";
import Attest from "@/components/Attest";

export default function Home() {

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <WalletFuncs />
        <Attest />
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
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />
    </header>
  );
}
