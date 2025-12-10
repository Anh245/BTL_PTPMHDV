import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authServicesAPI.js";




export const useAuthStore = create(
  persist(
    (set, get) => ({
 accessToken: null,
 user: null,
 loading: false,


    setAccessToken: (accessToken) => {
       set({ accessToken });
    },

    clearState:() =>{
        set({accessToken : null,user : null, loading :false} )
    } ,
    signUp: async(firstname,lastname,username, email, password) => {
        try {
            set({ loading: true });

            //goi API signup
            await authService.signUp(firstname,lastname,username, email, password);
            toast.success("Signup successful!");
        } catch (error) {
            console.error("Signup failed:", error);
            toast.error("Signup failed. Please try again.");
        } finally {
            set({ loading: false });
        }

    },

    signIn: async(username, password) => {

        try {
            set({ loading: true });

            const{accessToken} = await authService.signIn(username, password);
            
            get().setAccessToken(accessToken);
             await get().fetchMe();
            toast.success("Signin successful!");


        } catch (error) {
            console.error("Signin failed:", error);
            toast.error("Signin failed. Please try again.");
        }
        finally{
            set({loading: false});
           
        }
    },
    signOut: async () => {
        try {
            
            get().clearState();
            await authService.signOut();
            toast.success("Signout successful!");
            console.log("Signout successful!");
            

        }catch (error) {
            console.error("Signout failed:", error);
            toast.error("Signout failed. Please try again.");
        } 
    
    },
    fetchMe : async () => {
        try {
            set({ loading: true });

            const user = await authService.fetchMe();
            if (!user) {
                throw new Error('No user data received');
            }
            set({ user });
        } catch (error) {
            console.error("Fetch me failed:", error);
            
            // Nếu lỗi 401/403, có thể token không hợp lệ
            if (error.response?.status === 401 || error.response?.status === 403) {
                get().clearState();
                throw error; // Throw để ProtectRoute xử lý
            } else {
                // Lỗi khác, chỉ clear user
                set({ user: null });
                toast.error("Lỗi khi lấy dữ liệu người dùng.");
            }
        }
        finally {
            set({ loading: false });
        }
    },
    refresh: async () => { 
        try {
            set({ loading: true });

            const accessToken = await authService.refresh();
            
            if (!accessToken) {
                throw new Error('No access token received from refresh');
            }
            
            get().setAccessToken(accessToken);
            // Không gọi fetchMe ở đây, để ProtectRoute xử lý
        } catch (error) {
            console.error("Refresh thất bại:", error);
            // Clear state khi refresh thất bại
            get().clearState();
            throw error; // Throw để ProtectRoute biết refresh thất bại
        } finally {
            set({ loading: false });
        }
    }
}),
    {
      name: 'auth-storage', // localStorage key
      partialPersist: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);