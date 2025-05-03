'use client';

import React, { useEffect, useState } from "react";
import {getDownloadLink, getStatus} from "@/api/file";

export default function ProcessingFile({ json }: { json: object | null }) {
    const [status, setStatus] = useState(json['job_id']);
    const [downloadLink, setDownloadLink] = useState<string | null>(null);

    useEffect(() => {
        if (json) {
            const interval = setInterval(() => {
                getStatus(status['job_id']).then((response) => {
                    if (response['status'] == "completed") {
                        setDownloadLink(response['job_id']);
                        clearInterval(interval);
                    }
                }
                ).catch((error) => {
                    console.error("Error fetching status:", error);
                    clearInterval(interval);

                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [json]);

    async function downloadFile() {
        if (!downloadLink) return;

        const blob = await getDownloadLink(downloadLink); // Blob from API
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = status['file_name'] + status['code'] + ".srt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }
    if (!status) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40" />
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full z-50">
                <h2 className="text-2xl font-bold mb-4">Processing File</h2>

                {/* Show download link if completed */}
                {downloadLink ? (
                    <button
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        onClick={downloadFile}
                    >
                        Download result
                    </button>
                ) : (
                    <p className="mt-4">Processing... Current progress: {status['current']} of {status['amount']}</p>
                )}

                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => window.location.reload()}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
