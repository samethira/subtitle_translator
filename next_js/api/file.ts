import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export async function translateFile(file: File, language: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    const response = await apiClient.post("/translate", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}
export async function getStatus(id: string) {
    const response = await apiClient.get("/status/" + id);
    return response.data;
}

export async function getDownloadLink(id: string | null) {
    const response = await apiClient.get("/download/" + id, {
        responseType: 'blob'
    });
    return response.data;
}