import { create } from "zustand";

import { fetchMe } from "@/services/api/auth";

export type LocalUser = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
};

type UserStore = {
    user: LocalUser | null;
    // load fetches the session identity from the login service on boot; a
    // missing or expired session redirects to /login inside fetchMe.
    load: () => Promise<void>;
    clearSession: () => void;
};

export const useUserStore = create<UserStore>()((set) => ({
    user: null,
    load: async () => {
        try {
            const me = await fetchMe();
            set({ user: { id: me.username, username: me.username, displayName: me.display_name || me.username, avatarUrl: "" } });
        } catch {
            // fetchMe already redirects on 401; other failures (login
            // service unreachable, e.g. local dev) keep the fallback label.
        }
    },
    clearSession: () => set({ user: null }),
}));
