import { Config } from "@/constants/config";

class ApiService {
    private getHeaders() {
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": Config.API_KEY,
        };
    }

    private unwrap<T>(json: any): T {
        return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${Config.API_URL}${endpoint}`, {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`);
        }

        return this.unwrap<T>(data);
    }

    async post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
        const response = await fetch(`${Config.API_URL}${endpoint}`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`);
        }

        return this.unwrap<T>(data);
    }

    async put<T = unknown>(endpoint: string, body: unknown): Promise<T> {
        const response = await fetch(`${Config.API_URL}${endpoint}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`);
        }

        return this.unwrap<T>(data);
    }

    async delete<T = unknown>(endpoint: string): Promise<T> {
        const response = await fetch(`${Config.API_URL}${endpoint}`, {
            method: "DELETE",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`);
        }

        return this.unwrap<T>(data);
    }
}

export default new ApiService();