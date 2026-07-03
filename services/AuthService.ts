import SecureStorage from "./SecureStorage";

class AuthService {
    async isLoggedIn(): Promise<boolean> {
        const token = await SecureStorage.getToken();

        return token !== null && token.length > 0;
    }

    async logout() {
        await SecureStorage.removeToken();
    }
}

export default new AuthService();