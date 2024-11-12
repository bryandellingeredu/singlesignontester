import { makeAutoObservable, reaction } from "mobx";
import { UserManager, WebStorageStateStore, User } from 'oidc-client-ts';

export default class UserStore {
    token: string | null = null;
    userManager: UserManager;

    constructor() {
        makeAutoObservable(this);

        // Configuration for the OpenIddict server
        const config = {
            authority: 'https://localhost:7274', // OpenIddict server URL
            client_id: 'new-client-id', // The client ID registered in OpenIddict
            redirect_uri: 'http://localhost:3000/callback', // Redirect URI after successful login
            response_type: 'code', // Authorization Code Flow
            scope: 'openid profile email', // Include required scopes
            post_logout_redirect_uri: 'http://localhost:3000/',
            userStore: new WebStorageStateStore({ store: window.localStorage })
        };

        // Create a UserManager instance based on the config
        this.userManager = new UserManager(config);

        // Reaction to keep token in local storage
        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        );

        // Load token from local storage if available
        const savedToken = window.localStorage.getItem('jwt');
        if (savedToken) {
            this.token = savedToken;
        }

        // Automatically check for user on initialization
        this.userManager.getUser().then(user => {
            if (user && !user.expired) {
                this.token = user.access_token;
            } else {
                this.token = null;
            }
        }).catch(error => {
            console.error("User loading error:", error);
        });
    }

    // Method to start the login process by redirecting to the /login endpoint on your server
    login = () => {
        try {
            // Ensure all parameters are strings, defaulting to an empty string if undefined
            const queryParams = new URLSearchParams({
                redirect_uri: this.userManager.settings.redirect_uri || "",
            }).toString();
    
            // Redirect to the login endpoint with query parameters
            window.location.href = `https://localhost:7274/login?${queryParams}&buttons=army,edu,email`;
        } catch (error) {
            console.error("Login error:", error);
        }
    };
    // Method to log out the user
    logout = async () => {
        try {
            await this.userManager.signoutRedirect();
            this.token = null;
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    // Method to handle the callback after login
    handleCallback = async () => {
        try {
            // Manually parse the token from the query string
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token'); // Assumes token is passed as ?token=...
    
            if (token) {
                this.token = token;
                console.log("Token obtained from query string:", token);
                window.localStorage.setItem('jwt', this.token);
            } else {
                console.warn("No token found in the callback URL.");
            }
        } catch (error) {
            console.error("Callback error:", error);
        }
    };
    renewToken = async () => {
        try {
            const user = await this.userManager.signinSilent();
            if (user) {
                this.token = user.access_token;
            } else {
                this.token = null;
                console.warn("Token renewal failed: No user returned from signinSilent.");
            }
        } catch (error) {
            console.error("Token renewal error:", error);
            this.token = null;
        }
    }

    // Computed property to check if the user is logged in
    get isLoggedIn() {
        return !!this.token;
    }
}
