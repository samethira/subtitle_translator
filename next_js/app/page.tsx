import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/*header*/}
        <header className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
        {/*  title*/}
        <h1 className="text-4xl font-bold text-gray-900">
          Translate your subtitles to your desired language!
        </h1>
        </header>
    </div>
  );
}
