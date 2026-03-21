/**
 * Kavex Authentication Service
 * Handles all Supabase Auth interactions, session persistence, and role-based access.
 */

const auth = {
    /**
     * Signup a new Seller
     */
    async signUpSeller(email, password, fullName, businessName, phone) {
        try {
            const { data: { user }, error: signUpError } = await window.kavexSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, business_name: businessName, phone: phone }
                }
            });

            if (signUpError) throw signUpError;

            // Insert into profiles
            const { error: profileError } = await window.kavexSupabase
                .from('profiles')
                .insert([{ id: user.id, full_name: fullName, company_name: businessName, role: 'seller' }]);

            if (profileError) throw profileError;

            // Insert into seller_profiles
            const storeSlug = businessName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const { error: sellerError } = await window.kavexSupabase
                .from('seller_profiles')
                .insert([{ user_id: user.id, store_name: businessName, store_slug: storeSlug }]);

            if (sellerError) throw sellerError;

            return { success: true, user };
        } catch (error) {
            console.error("Seller Signup Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Signup a new Buyer
     */
    async signUpBuyer(email, password, fullName, businessName, phone, country) {
        try {
            const { data: { user }, error: signUpError } = await window.kavexSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, business_name: businessName, phone: phone, country: country }
                }
            });

            if (signUpError) throw signUpError;

            // Insert into profiles
            const { error: profileError } = await window.kavexSupabase
                .from('profiles')
                .insert([{ id: user.id, full_name: fullName, role: 'buyer' }]);

            if (profileError) throw profileError;

            return { success: true, user };
        } catch (error) {
            console.error("Buyer Signup Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sign In
     */
    async signIn(email, password) {
        try {
            const { data: { user, session }, error } = await window.kavexSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get profile to check role
            const { data: profile, error: profileError } = await window.kavexSupabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // Redirect based on role
            this._handleRedirect(profile.role);

            return { success: true, user, role: profile.role };
        } catch (error) {
            console.error("SignIn Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Sign Out
     */
    async signOut() {
        await window.kavexSupabase.auth.signOut();
        localStorage.clear();
        window.location.href = '/index.html';
    },

    /**
     * Get Current User & Profile
     */
    async getCurrentUser() {
        const { data: { user } } = await window.kavexSupabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await window.kavexSupabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return { user, profile };
    },

    /**
     * Check if Authenticated
     */
    async isAuthenticated() {
        const { data: { session } } = await window.kavexSupabase.auth.getSession();
        return !!session;
    },

    /**
     * Require Auth middleware
     */
    async requireAuth(requiredRole) {
        const data = await this.getCurrentUser();
        if (!data) {
            window.location.href = '/pages/auth/login.html';
            return null;
        }

        if (requiredRole && data.profile.role !== requiredRole) {
            window.location.href = '/index.html';
            return null;
        }

        return data;
    },

    /**
     * Auth state change listener
     */
    onAuthStateChange(callback) {
        return window.kavexSupabase.auth.onAuthStateChange(callback);
    },

    /**
     * Password Reset
     */
    async resetPassword(email) {
        return await window.kavexSupabase.auth.resetPasswordForEmail(email);
    },

    async updatePassword(newPassword) {
        return await window.kavexSupabase.auth.updateUser({ password: newPassword });
    },

    /**
     * Private Redirect Handler
     */
    _handleRedirect(role) {
        if (role === 'seller') window.location.href = '/pages/auth/seller-register.html'; // Or dashboard if already registered
        else if (role === 'buyer') window.location.href = '/pages/buyer/dashboard.html';
        else if (role === 'admin') window.location.href = '/pages/admin/index.html';
        else window.location.href = '/index.html';
    }
};

window.kavexAuth = auth;
