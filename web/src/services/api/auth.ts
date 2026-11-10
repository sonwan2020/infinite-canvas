// Session endpoints of the guantou-login front-door service, reached same-origin
// under /login (nginx strips the prefix). The canvas holds no session itself:
// the login service owns the guantou_session cookie and clears it together with
// the new-api console cookies it forwarded at login time.
export async function logout(): Promise<void> {
    try {
        await fetch("/login/api/v1/logout", {
            method: "POST",
            headers: { "X-Requested-With": "fetch" },
        });
    } finally {
        window.location.href = "/login";
    }
}

export type SessionUser = {
    username: string;
    display_name: string;
};

// Fetches the current session identity from the login service. A 401 means the
// guantou_session cookie is missing or expired: the page bounces to /login so
// an anonymous visitor never stays on the canvas. Other failures (e.g. the
// login service is unreachable in local development) leave the page alone.
export async function fetchMe(): Promise<SessionUser> {
    const response = await fetch("/login/api/v1/me", { headers: { "X-Requested-With": "fetch" } });
    if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("not logged in");
    }
    if (!response.ok) throw new Error(`session check failed: ${response.status}`);
    return (await response.json()) as SessionUser;
}
