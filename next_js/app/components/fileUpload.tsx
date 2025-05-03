'use client';

import {useState} from "react";
import axios from "axios";
import {translateFile} from "@/api/file";
import ProcessingFile from "@/app/components/processingFile";
export default function FileUpload() {

    // fields
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [language, setLanguage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [json, setJson] = useState<object | null>(null);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            if (fileExtension !== "srt") {
                setError("Please select a valid .srt file.");
                return;
            }
            if (file.size > 1024 * 1024) {
                setError("File size exceeds 1 MB.");
                return;
            }
            setError("");
            setSelectedFile(file);
        }
    }
    function handleLanguageChange(event : React.ChangeEvent<HTMLSelectElement>) {
        setLanguage(event.target.value);
    }

    /*progressing upload*/
    async function handleUpload() {
        // @ts-ignore
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }
        if (!language) {
            setError("Please select a language.");
            return;
        }
        setError("");

        const progress = await translateFile(selectedFile, language);
        if(progress['job_id']['status'] == 'pending')
        {
            setSuccess(true);
            setJson(progress);
        }
        else
            setError("File translation failed. Please try again.");

    }
    return (
        <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800">Upload a File</h1>
            <p className="mt-2 text-gray-600">
                Select a subtitle file (.srt) to upload and translate.
            </p>
            {/*error*/}
            {error && (
                <div className="mt-4 text-red-500">
                    <p>{error}</p>
                </div>
            )}
            {/*file upload*/}
            <div className="mt-6 w-full max-w-md">
                <input
                    onChange={(e) => handleFileChange(e)}
                    type="file"
                    accept=".srt"
                    className="block w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="mt-4 w-full max-w-md">
                <select onChange={(e) => handleLanguageChange(e)} className="block w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Language</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="italian">Italian</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="russian">Russian</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                    <option value="arabic">Arabic</option>
                    <option value="hindi">Hindi</option>
                    <option value="bengali">Bengali</option>
                    <option value="urdu">Urdu</option>
                    <option value="turkish">Turkish</option>
                    <option value="dutch">Dutch</option>
                    <option value="swedish">Swedish</option>
                    <option value="polish">Polish</option>
                    <option value="thai">Thai</option>
                    <option value="vietnamese">Vietnamese</option>
                    <option value="greek">Greek</option>
                </select>
            </div>
            <button onClick={handleUpload}
                className="mt-6 px-6 py-3 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                Upload & Translate
            </button>
            {/*success*/}
            {success && (
                <ProcessingFile json={json} />
            )}
        </div>
    );
}