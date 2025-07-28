import { supabase } from '../supabaseClient';
import { AuthResponse } from '../../utils/types';

class AuthService {
    async login(credentials: { identifier: string; password: string }): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.identifier,
            password: credentials.password,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.session?.access_token) {
            localStorage.setItem('access_token', data.session.access_token);
        }

                return {
                    jwt: data.session?.access_token || '',
                    user: {
                        id: data.user?.id || '',
                        email: data.user?.email || '',
                        user_metadata: {
                            username: data.user?.user_metadata?.username || '',
                        },
                    },
                };
    }

    async logout(): Promise<void> {
        localStorage.removeItem('access_token');
        await supabase.auth.signOut();
    }

    async register(userInfo: { username: string; email: string; password: string }): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp({
            email: userInfo.email,
            password: userInfo.password,
            options: {
                data: {
                    username: userInfo.username ?? '',
                },
            },
        });

        if (error) {
            throw new Error(error.message);
        }

                return {
                    jwt: data.session?.access_token || '',
                    user: {
                        id: data.user?.id || '',
                        email: userInfo.email,
                        user_metadata: {
                            username: userInfo.username,
                        },
                    },
                };
    }

    isAuthenticated(): boolean {
        return localStorage.getItem('access_token') !== null;
    }

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    async onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

export default new AuthService();
