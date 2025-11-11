// lib/chat-service.ts

import { createServer } from "@/utils/supabase/server";
// Types
export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "public" | "private" | "direct";
  category?: string;
  created_by?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: Message;
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: "admin" | "moderator" | "member";
  joined_at: string;
  last_read_at: string;
  notification_enabled: boolean;
  user?: User;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  edited: boolean;
  edited_at?: string;
  parent_message_id?: string;
  is_deleted: boolean;
  metadata?: any;
  created_at: string;
  user?: User;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  mentions?: string[];
  parent_message?: Message;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "moderator" | "user";
  first_name: string;
  last_name: string;
  username?: string;
  profile_image_url?: string;
  bio?: string;
}

// Channel Functions
export const channelService = {
  // Get all channels for current user
  async getChannels(userId: string): Promise<Channel[]> {
    const supabase = createServer();

    const { data: memberChannels, error } = await supabase
      .from("channel_members")
      .select(
        `
        channel:chat_channels (
          *,
          members:channel_members (
            *,
            user:users (*)
          )
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    // Get public channels user is not a member of
    const { data: publicChannels } = await supabase
      .from("chat_channels")
      .select("*")
      .eq("type", "public")
      .eq("is_archived", false);

    // Combine and deduplicate
    const allChannels = [
      ...(memberChannels?.map((m) => m.channel) || []),
      ...(publicChannels || []),
    ].filter(
      (channel, index, self) =>
        index === self.findIndex((c) => c?.id === channel?.id)
    );

    // Get unread counts for each channel
    const channelsWithUnread = await Promise.all(
      allChannels.map(async (channel) => {
        if (!channel) return null;

        const { data: unreadCount } = await supabase.rpc("get_unread_count", {
          p_channel_id: channel.id,
          p_user_id: userId,
        });

        return {
          ...channel,
          unread_count: unreadCount || 0,
        };
      })
    );

    return channelsWithUnread.filter(Boolean) as Channel[];
  },

  // Create a new channel
  async createChannel(
    name: string,
    type: "public" | "private",
    category?: string,
    description?: string,
    memberIds?: string[]
  ): Promise<Channel> {
    const supabase = createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from("chat_channels")
      .insert({
        name,
        type,
        category,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (channelError) throw channelError;

    // Add creator as admin
    const members = [
      { channel_id: channel.id, user_id: user.id, role: "admin" },
      ...(memberIds?.map((id) => ({
        channel_id: channel.id,
        user_id: id,
        role: "member" as const,
      })) || []),
    ];

    const { error: memberError } = await supabase
      .from("channel_members")
      .insert(members);

    if (memberError) throw memberError;

    return channel;
  },

  // Join a public channel
  async joinChannel(channelId: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("channel_members").insert({
      channel_id: channelId,
      user_id: user.id,
      role: "member",
    });

    if (error) throw error;
  },

  // Leave a channel
  async leaveChannel(channelId: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", user.id);

    if (error) throw error;
  },

  // Update last read timestamp
  async markChannelAsRead(channelId: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("channel_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("channel_id", channelId)
      .eq("user_id", user.id);

    if (error) throw error;
  },
};

// Message Functions
export const messageService = {
  // Get messages for a channel
  async getMessages(
    channelId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    const supabase = createServer();

    let query = supabase
      .from("chat_messages")
      .select(
        `
        *,
        user:users (*),
        reactions:message_reactions (
          *,
          user:users (*)
        ),
        attachments:message_attachments (*),
        mentions:message_mentions (
          *,
          mentioned_user:users (*)
        ),
        parent_message:chat_messages!parent_message_id (
          *,
          user:users (*)
        )
      `
      )
      .eq("channel_id", channelId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.reverse(); // Reverse to get chronological order
  },

  // Send a message
  async sendMessage(
    channelId: string,
    content: string,
    parentMessageId?: string,
    metadata?: any
  ): Promise<Message> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        channel_id: channelId,
        user_id: user.id,
        content,
        parent_message_id: parentMessageId,
        metadata,
      })
      .select(
        `
        *,
        user:users (*),
        reactions:message_reactions (*),
        attachments:message_attachments (*)
      `
      )
      .single();

    if (error) throw error;

    // Process mentions
    const mentions = content.match(/@(\w+)/g);
    if (mentions) {
      const usernames = mentions.map((m) => m.slice(1));
      const { data: mentionedUsers } = await supabase
        .from("users")
        .select("id, username")
        .in("username", usernames);

      if (mentionedUsers?.length) {
        await supabase.from("message_mentions").insert(
          mentionedUsers.map((u) => ({
            message_id: data.id,
            mentioned_user_id: u.id,
          }))
        );
      }
    }

    return data;
  },

  // Edit a message
  async editMessage(messageId: string, content: string): Promise<void> {
    const supabase = createServer();

    const { error } = await supabase
      .from("chat_messages")
      .update({
        content,
        edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    if (error) throw error;
  },

  // Delete a message (soft delete)
  async deleteMessage(messageId: string): Promise<void> {
    const supabase = createServer();

    const { error } = await supabase
      .from("chat_messages")
      .update({ is_deleted: true })
      .eq("id", messageId);

    if (error) throw error;
  },

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });

    if (error && error.code !== "23505") throw error; // Ignore duplicate error
  },

  // Remove reaction
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .eq("emoji", emoji);

    if (error) throw error;
  },

  // Pin a message
  async pinMessage(channelId: string, messageId: string): Promise<void> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("pinned_messages").insert({
      channel_id: channelId,
      message_id: messageId,
      pinned_by: user.id,
    });

    if (error) throw error;
  },

  // Unpin a message
  async unpinMessage(channelId: string, messageId: string): Promise<void> {
    const supabase = createServer();

    const { error } = await supabase
      .from("pinned_messages")
      .delete()
      .eq("channel_id", channelId)
      .eq("message_id", messageId);

    if (error) throw error;
  },

  // Get pinned messages
  async getPinnedMessages(channelId: string): Promise<Message[]> {
    const supabase = createServer();

    const { data, error } = await supabase
      .from("pinned_messages")
      .select(
        `
        message:chat_messages (
          *,
          user:users (*),
          reactions:message_reactions (*),
          attachments:message_attachments (*)
        )
      `
      )
      .eq("channel_id", channelId);

    if (error) throw error;

    // @ts-expect-error TODO fix me
    return data.map((d) => d.message);
  },
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to channel messages
  async subscribeToChannel(
    channelId: string,
    callbacks: {
      onMessage?: (message: Message) => void;
      onMessageUpdate?: (message: Message) => void;
      onMessageDelete?: (messageId: string) => void;
      onReaction?: (reaction: MessageReaction) => void;
      onTyping?: (userId: string) => void;
    }
  ) {
    const supabase = createServer();

    const channel = supabase
      .channel(`channel:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch complete message with relations
          const { data } = await supabase
            .from("chat_messages")
            .select(
              `
              *,
              user:users (*),
              reactions:message_reactions (*),
              attachments:message_attachments (*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data && callbacks.onMessage) {
            callbacks.onMessage(data);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          if (payload.new.is_deleted && callbacks.onMessageDelete) {
            callbacks.onMessageDelete(payload.new.id);
          } else if (callbacks.onMessageUpdate) {
            callbacks.onMessageUpdate(payload.new as Message);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_reactions",
        },
        async (payload) => {
          // Check if reaction is for a message in this channel
          const { data: message } = await supabase
            .from("chat_messages")
            .select("channel_id")
            .eq("id", payload.new.message_id)
            .single();

          if (message?.channel_id === channelId && callbacks.onReaction) {
            callbacks.onReaction(payload.new as MessageReaction);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        // Handle presence updates for typing indicators
      })
      .subscribe();

    return channel;
  },

  // Unsubscribe from channel
  async unsubscribeFromChannel(channel: any) {
    const supabase = createServer();
    supabase.removeChannel(channel);
  },

  // Send typing indicator
  async sendTypingIndicator(channelId: string) {
    const supabase = createServer();

    const channel = supabase.channel(`channel:${channelId}`);
    await channel.track({
      typing: true,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });
  },
};

// Direct Message Functions
export const directMessageService = {
  // Create or get existing DM channel
  async getOrCreateDMChannel(otherUserId: string): Promise<string> {
    const supabase = createServer();

    const { data, error } = await supabase.rpc(
      "create_direct_message_channel",
      {
        other_user_id: otherUserId,
      }
    );

    if (error) throw error;
    return data;
  },

  // Get all DM channels for current user
  async getDMChannels(): Promise<Channel[]> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("channel_members")
      .select(
        `
        channel:chat_channels!inner (
          *,
          members:channel_members (
            *,
            user:users (*)
          )
        )
      `
      )
      .eq("user_id", user.id)
      .eq("channel.type", "direct");

    if (error) throw error;

    // Format DM channels with other user's info
    // @ts-expect-error TODO fix me

    return data.map((item) => {
      const channel = item.channel;
      // @ts-expect-error TODO fix me

      const otherMember = channel.members?.find((m) => m.user_id !== user.id);
      return {
        ...channel,
        name: otherMember?.user
          ? `${otherMember.user.first_name} ${otherMember.user.last_name}`
          : "Direct Message",
        other_user: otherMember?.user,
      };
    });
  },
};

// File Upload Functions
export const fileUploadService = {
  async uploadFile(
    file: File,
    channelId: string
  ): Promise<{ url: string; path: string }> {
    const supabase = createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop();
    const fileName = `${channelId}/${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);

    return { url: publicUrl, path: fileName };
  },

  async deleteFile(path: string): Promise<void> {
    const supabase = createServer();

    const { error } = await supabase.storage
      .from("chat-attachments")
      .remove([path]);

    if (error) throw error;
  },
};
