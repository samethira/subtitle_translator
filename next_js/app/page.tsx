import FileUpload from "@/app/components/fileUpload";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center md:justify-center md:pt-0 pt-8">
            {/* Title Section */}
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900">AI Subtitles Translator</h1>
                <p className="mt-4 text-lg text-gray-700">
                    No login required! Just upload your .srt file and select a language to translate.
                </p>
            </header>
            {/* Main container */}
            <div className="w-full max-w-2xl p-4 mx-auto bg-white shadow-md rounded-lg">
                {/* Main */}
                <main className="flex flex-col items-center">
                    {/* File upload */}
                    <FileUpload />
                </main>
            </div>
        </div>
    );
}