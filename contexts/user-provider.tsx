"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/utils/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { getOrCreateUserProfile } from "@/lib/xp/user-xp-utils";
import { fetchMasterCategories } from "@/lib/fetch-tricks"; // NEW
import type { MasterCategory } from "@/lib/types/database"; // NEW

export type UserRole = "user" | "administrator" | "moderator";

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_image_url?: string;
  phone?: string;
  date_of_birth?: string;
  created_at?: string;
  updated_at?: string;
  username?: string;
  users_sports_ids?: string[];
  referrals?: number;
  xp?: number;
}

interface UserContextType {
  user: PublicUser | null;
  authUser: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<PublicUser>) => Promise<PublicUser>;
  awardXP: (
    xpAmount: number,
    reason?: string
  ) => Promise<{ success: boolean; newXP: number; error?: string }>;
  isAuthenticated: () => boolean;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
  hasRole: (role: UserRole) => boolean;
  // NEW user category helpers
  userCategoryIds: string[];
  userCategories: MasterCategory[];
  updateUserSports: (categoryIds: string[]) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const UserProviderComponent = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // NEW state for category resolution
  const [allCategoriesCache, setAllCategoriesCache] = useState<
    MasterCategory[] | null
  >(null);
  const [userCategories, setUserCategories] = useState<MasterCategory[]>([]);

  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);

  // Track if we're currently fetching to prevent duplicate fetches
  const fetchingRef = useRef(false);

  const fetchUser = useCallback(async (id: string) => {
    // Prevent duplicate fetches
    if (fetchingRef.current) {
      console.log("Already fetching user, skipping...");
      return null;
    }

    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (!isMounted.current) return null;

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Public user profile not found, creating one...");

          // Get auth user data for the email
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser();

          if (!authError && authUser && authUser.id === id) {
            // Use utility function to create user profile
            const result = await getOrCreateUserProfile(
              supabase,
              id,
              authUser.email!
            );

            if (result.success && result.user) {
              if (isMounted.current) {
                setUser(result.user);
                setIsLoading(false);
              }
              return result.user;
            } else {
              console.error("Failed to create user profile:", result.error);
            }
          }

          return null;
        }
        throw error;
      }

      if (isMounted.current) {
        setUser(data);
        setIsLoading(false);
      }

      return data;
    } catch (error: any) {
      console.error("Could not fetch user", error);

      if (isMounted.current) {
        setError(
          error instanceof Error ? error : new Error("Failed to fetch user")
        );
        setIsLoading(false);
      }

      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    isMounted.current = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted.current) return;

        if (error) {
          console.error("Error getting session:", error);
          setError(error);
          setIsLoading(false);
          return;
        }

        setAuthUser(session?.user ?? null);
        setAccessToken(session?.access_token);

        if (session?.user) {
          await fetchUser(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);

        if (isMounted.current) {
          setError(
            err instanceof Error ? err : new Error("Auth initialization failed")
          );
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty deps - only run once

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && isMounted.current) {
        setAuthUser(data.session.user);
        setAccessToken(data.session.access_token);
        await fetchUser(data.session.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error(
        "Error signing in:",
        error instanceof Error ? error.message : error
      );

      if (isMounted.current) {
        setError(
          error instanceof Error ? error : new Error("Failed to sign in")
        );
        setIsLoading(false);
      }

      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (isMounted.current) {
        setUser(null);
        setAuthUser(null);
        setAccessToken(undefined);
      }

      return { error: null };
    } catch (error) {
      console.error(
        "Error signing out:",
        error instanceof Error ? error.message : error
      );

      if (isMounted.current) {
        setError(
          error instanceof Error ? error : new Error("Failed to sign out")
        );
      }

      return { error };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!isMounted.current) return;

    try {
      setError(null);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session && isMounted.current) {
        setAuthUser(session.user);
        setAccessToken(session.access_token);
        await fetchUser(session.user.id);
      } else if (isMounted.current) {
        setAuthUser(null);
        setAccessToken(undefined);
        setUser(null);
      }
    } catch (err) {
      console.error("Refresh user error:", err);

      if (isMounted.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to refresh user")
        );
      }

      throw err;
    }
  };

  // Update user data
  const updateUser = async (updates: Partial<PublicUser>) => {
    try {
      setError(null);

      if (!authUser) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", authUser.id)
        .select()
        .single();

      if (error) throw error;

      if (isMounted.current) {
        setUser(data as PublicUser);
      }

      return data as PublicUser;
    } catch (err) {
      console.error("Update user error:", err);

      if (isMounted.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to update user")
        );
      }

      throw err;
    }
  };

  // Award XP to the current user
  const awardXP = async (xpAmount: number, reason: string = "general") => {
    try {
      setError(null);

      if (!authUser) {
        return { success: false, newXP: 0, error: "No user logged in" };
      }

      console.log(`=== AWARDING USER XP ===`);
      console.log(`User ID: ${authUser.id}`);
      console.log(`XP Amount: ${xpAmount}`);
      console.log(`Reason: ${reason}`);

      // Try to get current user data
      let currentUser = user;
      let currentXP = user?.xp || 0;

      // If user doesn't exist in context, try to fetch from database
      if (!currentUser) {
        const { data: fetchedUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            console.log("User not found in database, creating profile...");

            // Create a new user profile with the XP amount
            const newUserProfile = {
              id: authUser.id,
              email: authUser.email!,
              role: "user" as UserRole,
              first_name: "",
              last_name: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              xp: xpAmount,
              referrals: 0,
            };

            const { data: createdUser, error: createError } = await supabase
              .from("users")
              .insert(newUserProfile)
              .select()
              .single();

            if (createError) {
              console.error("Error creating user profile for XP:", createError);
              return { success: false, newXP: 0, error: createError.message };
            }

            // Update context with new user
            if (isMounted.current) {
              setUser(createdUser as PublicUser);
            }

            console.log(`✅ Created user profile with ${xpAmount} XP`);
            return { success: true, newXP: xpAmount };
          } else {
            console.error("Error fetching user for XP award:", fetchError);
            return { success: false, newXP: 0, error: fetchError.message };
          }
        }

        currentUser = fetchedUser as PublicUser;
        currentXP = fetchedUser.xp || 0;
      }

      // Calculate new XP
      const newXP = currentXP + xpAmount;

      console.log(`Current XP: ${currentXP}`);
      console.log(`New XP: ${newXP}`);

      // Update user XP in database
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          xp: newXP,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user XP:", updateError);
        return { success: false, newXP: 0, error: updateError.message };
      }

      // Update context with new XP
      if (isMounted.current) {
        setUser(updatedUser as PublicUser);
      }

      console.log(
        `✅ Successfully awarded ${xpAmount} XP. New total: ${newXP}`
      );
      return { success: true, newXP };
    } catch (err) {
      console.error("Award XP error:", err);

      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Failed to award XP"));
      }

      return {
        success: false,
        newXP: 0,
        error: err instanceof Error ? err.message : "Failed to award XP",
      };
    }
  };

  // Permission helpers
  const isAuthenticated = () => {
    return !!authUser && !!user;
  };

  const hasAdminAccess = () => {
    return user?.role === "administrator";
  };

  const hasModeratorAccess = () => {
    return (
      user?.role === "moderator" ||
      user?.role === "administrator" ||
      (user?.xp ?? 0) >= 1500
    );
  };

  const hasRole = (role: UserRole) => {
    if (!user) return false;
    if (role === "user") return true;
    if (role === "moderator") return hasModeratorAccess();
    if (role === "administrator") return hasAdminAccess();
    return user.role === role;
  };

  // Effect to load user categories based on users_sports_ids
  useEffect(() => {
    // When user sports ids change, ensure categories loaded & derive userCategories
    const loadCategoriesIfNeeded = async () => {
      const ids = user?.users_sports_ids || [];
      if (ids.length === 0) {
        setUserCategories([]);
        return;
      }
      try {
        let categoriesData = allCategoriesCache;
        if (!categoriesData) {
          const result = await fetchMasterCategories();
          if (result.success) {
            categoriesData = result.data as MasterCategory[];
            setAllCategoriesCache(categoriesData);
          } else {
            console.warn(
              "Failed fetching categories for user provider:",
              result.error
            );
            categoriesData = [] as MasterCategory[];
          }
        }
        if (categoriesData) {
          const mapped = categoriesData.filter((c) => ids.includes(c.id));
          setUserCategories(mapped);
        }
      } catch (e) {
        console.error("Error resolving user categories:", e);
      }
    };
    loadCategoriesIfNeeded();
  }, [user?.users_sports_ids, allCategoriesCache]);

  const updateUserSports = async (categoryIds: string[]) => {
    await updateUser({ users_sports_ids: categoryIds });
    // user state already updated inside updateUser; effect above will recompute userCategories
  };

  const contextValue = useMemo(
    () => ({
      user,
      authUser,
      isLoading,
      error,
      signIn,
      signOut,
      refreshUser,
      updateUser,
      awardXP,
      isAuthenticated,
      hasAdminAccess,
      hasModeratorAccess,
      hasRole,
      userCategoryIds: user?.users_sports_ids || [], // NEW
      userCategories, // NEW
      updateUserSports, // NEW
    }),
    [
      user,
      authUser,
      isLoading,
      error,
      signIn,
      signOut,
      refreshUser,
      updateUser,
      awardXP,
      isAuthenticated,
      hasAdminAccess,
      hasModeratorAccess,
      hasRole,
      userCategories,
      updateUserSports,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const UserProvider = React.memo(UserProviderComponent);
