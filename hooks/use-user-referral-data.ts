import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

import { useUser } from "@/contexts/user-provider";

export interface ReferredUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export interface UserReferralData {
  referrals: number;
  email: string;
  referral_user_ids: string[];
  referred_users: ReferredUser[];
}

export function useUserReferralData() {
  const [data, setData] = useState<UserReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function fetchReferralData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("referrals, email, referral_user_ids")
          .eq("id", user.id)
          .single();

        if (error) {
          // If user doesn't exist in public.users table, return default values
          if (error.code === "PGRST116") {
            console.log("User not found in referral data fetch, returning defaults");
            setData({
              referrals: 0,
              email: user.email || "",
              referral_user_ids: [],
              referred_users: [],
            });
            setLoading(false);
            return;
          }
          setError(error.message);
          return;
        }

        // If there are referred user IDs, fetch their details
        let referredUsers: ReferredUser[] = [];
        if (
          userData.referral_user_ids &&
          userData.referral_user_ids.length > 0
        ) {
          const { data: referredUsersData, error: referredUsersError } =
            await supabase
              .from("users")
              .select("id, email, first_name, last_name, created_at")
              .in("id", userData.referral_user_ids)
              .order("created_at", { ascending: false });

          if (referredUsersError) {
            console.error(
              "Failed to fetch referred users:",
              referredUsersError
            );
          } else {
            referredUsers = referredUsersData || [];
          }
        }

        setData({
          ...userData,
          referred_users: referredUsers,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchReferralData();
  }, [user]);

  return { data, loading, error };
}
