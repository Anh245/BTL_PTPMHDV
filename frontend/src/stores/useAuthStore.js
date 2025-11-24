import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authServicesAPI.js";




export const useAuthStore = create((set, get) => ({
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
            set({ user });
        } catch (error) {
            console.error("Fetch me failed:", error);
            set({ user: null,accessToken:null });
            toast.error("Loi khi lay du lieu nguoi dung.");
        }
        finally {
            set({ loading: false });
        }
    },
    refresh: async () => { 
        try {
            set({ loading: true });

            const {user, fetchMe, setAccessToken} = get();
            const accessToken = await authService.refresh();
            setAccessToken(accessToken);
            if(!user){
                await fetchMe();
            }
        } catch (error) {
            console.error("refesh that bai:", error);
            toast.error("Phien dang het han, vui long dang nhap lai.");
            get().clearState();
        } finally {
            set({ loading: false });
        }
    

    }
}));