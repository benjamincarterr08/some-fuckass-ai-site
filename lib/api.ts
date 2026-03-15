const API_BASE = "https://forum-api.forgecore.uk";

// JWT Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('forum_jwt', token);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('forum_jwt');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('forum_jwt');
  }
  return null;
};

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  reputation: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  sort_order: number;
}

export interface Tag {
  id: string;
  name: string;
  category_id: string | null;
}

export interface Topic {
  id: string;
  title: string;
  body: string;
  category_id: string;
  created_by: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  last_active_at: string;
  // Joined fields
  author?: Profile;
  category?: Category;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  topic_id: string;
  parent_comment_id: string | null;
  created_by: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  // Joined fields
  author?: Profile;
  replies?: Comment[];
  score?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  granted_at: string;
  role?: Role;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  granted_at: string;
  badge?: Badge;
}

export interface SiteSettings {
  id: string;
  forum_name: string;
  maintenance_mode: boolean;
  top_banner_icon: string | null;
  top_banner_colour: string | null;
  top_banner_text: string | null;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile: Profile;
  roles: Role[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  reference_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  topic_id?: string;
  comment_id?: string;
  user_id: string;
  value: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  data: T[];
}

export interface SearchResults {
  topics: Topic[];
  comments: Comment[];
  profiles: Profile[];
}

// Generic fetch wrapper with JWT support
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { authenticated?: boolean }
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  
  // Add JWT token if available and not explicitly disabled
  if (token && options?.authenticated !== false) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Request failed" }));
    // Handle various error response formats from the API
    const errorMessage = 
      errorData.error || 
      errorData.message || 
      errorData.detail ||
      (typeof errorData === 'string' ? errorData : `Request failed with status ${res.status}`);
    console.error("[v0] API Error:", res.status, errorData);
    throw new Error(errorMessage);
  }

  return res.json();
}

// Health check
export const checkHealth = () => apiFetch<{ ok: boolean }>("/health");

// Users
export const getUsers = (params?: { search?: string; page?: number; pageSize?: number }) => {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  return apiFetch<PaginatedResponse<User>>(`/users?${query}`);
};

export const getUser = (id: string) => apiFetch<User>(`/users/${id}`);

export const createUser = (data: { email: string; password_hash: string }) =>
  apiFetch<User>("/users", { method: "POST", body: JSON.stringify(data) });

export const updateUser = (id: string, data: Partial<{ email: string; password_hash: string }>) =>
  apiFetch<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteUser = (id: string) =>
  apiFetch<void>(`/users/${id}`, { method: "DELETE" });

export const getUserProfile = (id: string) => apiFetch<Profile>(`/users/${id}/profile`);

export const getUserRoles = (id: string) => apiFetch<{ id: string; name: string }[]>(`/users/${id}/roles`);

export const getUserBadges = (id: string) => apiFetch<Badge[]>(`/users/${id}/badges`);

export const getUserTopics = (id: string) => apiFetch<Topic[]>(`/users/${id}/topics`);

export const getUserComments = (id: string) => apiFetch<Comment[]>(`/users/${id}/comments`);

export const getUserNotifications = (id: string, unread?: boolean) => {
  const query = unread ? "?unread=true" : "";
  return apiFetch<Notification[]>(`/users/${id}/notifications${query}`);
};

// Profiles
export const getProfiles = (search?: string) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<Profile[]>(`/profiles${query}`);
};

export const getProfile = (id: string) => apiFetch<Profile>(`/profiles/${id}`);

export const getProfileByHandle = (handle: string) =>
  apiFetch<Profile>(`/profiles/by-handle/${handle}`);

export const createProfile = (data: {
  id: string;
  handle: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
}) => apiFetch<Profile>("/profiles", { method: "POST", body: JSON.stringify(data) });

export const updateProfile = (
  id: string,
  data: Partial<{ handle: string; display_name: string; bio: string; avatar_url: string; reputation: number }>
) => apiFetch<Profile>(`/profiles/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteProfile = (id: string) =>
  apiFetch<void>(`/profiles/${id}`, { method: "DELETE" });

// Categories
export const getCategories = () => apiFetch<Category[]>("/categories");

export const getCategory = (id: string) => apiFetch<Category>(`/categories/${id}`);

export const getCategoryBySlug = (slug: string) =>
  apiFetch<Category>(`/categories/slug/${slug}`);

export const createCategory = (data: {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}) => apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(data) });

export const updateCategory = (id: string, data: Partial<Category>) =>
  apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteCategory = (id: string) =>
  apiFetch<void>(`/categories/${id}`, { method: "DELETE" });

export const getCategoryTopics = (id: string) => apiFetch<Topic[]>(`/categories/${id}/topics`);

export const getCategoryTags = (id: string) => apiFetch<Tag[]>(`/categories/${id}/tags`);

// Tags
export const getTags = (categoryId?: string) => {
  const query = categoryId ? `?category_id=${categoryId}` : "";
  return apiFetch<Tag[]>(`/tags${query}`);
};

export const getTag = (id: string) => apiFetch<Tag>(`/tags/${id}`);

export const createTag = (data: { name: string; category_id?: string | null }) =>
  apiFetch<Tag>("/tags", { method: "POST", body: JSON.stringify(data) });

export const updateTag = (id: string, data: Partial<Tag>) =>
  apiFetch<Tag>(`/tags/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteTag = (id: string) =>
  apiFetch<void>(`/tags/${id}`, { method: "DELETE" });

export const getTagTopics = (id: string) => apiFetch<Topic[]>(`/tags/${id}/topics`);

// Topics
export const getTopics = (params?: {
  page?: number;
  pageSize?: number;
  category_id?: string;
  created_by?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  search?: string;
  sort?: "created_at" | "last_active_at" | "view_count" | "reply_count";
}) => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.category_id) query.set("category_id", params.category_id);
  if (params?.created_by) query.set("created_by", params.created_by);
  if (params?.is_pinned !== undefined) query.set("is_pinned", String(params.is_pinned));
  if (params?.is_locked !== undefined) query.set("is_locked", String(params.is_locked));
  if (params?.search) query.set("search", params.search);
  if (params?.sort) query.set("sort", params.sort);
  return apiFetch<PaginatedResponse<Topic>>(`/topics?${query}`);
};

export const getTopic = (id: string) => apiFetch<Topic>(`/topics/${id}`);

export const createTopic = (data: {
  title: string;
  body: string;
  category_id: string;
  created_by: string;
  is_pinned?: boolean;
  is_locked?: boolean;
}) => apiFetch<Topic>("/topics", { method: "POST", body: JSON.stringify(data) });

export const updateTopic = (
  id: string,
  data: Partial<{
    title: string;
    body: string;
    category_id: string;
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    last_active_at: string;
  }>
) => apiFetch<Topic>(`/topics/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const incrementTopicView = (id: string) =>
  apiFetch<void>(`/topics/${id}/view`, { method: "POST" });

export const deleteTopic = (id: string) =>
  apiFetch<void>(`/topics/${id}`, { method: "DELETE" });

export const getTopicComments = (id: string) => apiFetch<Comment[]>(`/topics/${id}/comments`);

export const getTopicTags = (id: string) => apiFetch<Tag[]>(`/topics/${id}/tags`);

export const getTopicVotes = (id: string) =>
  apiFetch<{ score: number; votes: Vote[] }>(`/topics/${id}/votes`);

export const addTopicTag = (topicId: string, tagId: string) =>
  apiFetch<void>(`/topics/${topicId}/tags/${tagId}`, { method: "POST" });

export const removeTopicTag = (topicId: string, tagId: string) =>
  apiFetch<void>(`/topics/${topicId}/tags/${tagId}`, { method: "DELETE" });

export const voteOnTopic = (topicId: string, userId: string, value: 1 | -1) =>
  apiFetch<void>(`/topics/${topicId}/vote`, {
    method: "PUT",
    body: JSON.stringify({ user_id: userId, value }),
  });

export const removeTopicVote = (topicId: string, userId: string) =>
  apiFetch<void>(`/topics/${topicId}/vote/${userId}`, { method: "DELETE" });

// Comments
export const getComments = (params?: {
  topic_id?: string;
  created_by?: string;
  parent_comment_id?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.topic_id) query.set("topic_id", params.topic_id);
  if (params?.created_by) query.set("created_by", params.created_by);
  if (params?.parent_comment_id) query.set("parent_comment_id", params.parent_comment_id);
  return apiFetch<Comment[]>(`/comments?${query}`);
};

export const getComment = (id: string) => apiFetch<Comment>(`/comments/${id}`);

export const createComment = (data: {
  topic_id: string;
  parent_comment_id?: string | null;
  created_by: string;
  body: string;
}) => apiFetch<Comment>("/comments", { method: "POST", body: JSON.stringify(data) });

export const updateComment = (id: string, body: string) =>
  apiFetch<Comment>(`/comments/${id}`, { method: "PATCH", body: JSON.stringify({ body }) });

export const deleteComment = (id: string) =>
  apiFetch<void>(`/comments/${id}`, { method: "DELETE" });

export const getCommentReplies = (id: string) => apiFetch<Comment[]>(`/comments/${id}/replies`);

export const getCommentVotes = (id: string) =>
  apiFetch<{ score: number; votes: Vote[] }>(`/comments/${id}/votes`);

export const voteOnComment = (commentId: string, userId: string, value: 1 | -1) =>
  apiFetch<void>(`/comments/${commentId}/vote`, {
    method: "PUT",
    body: JSON.stringify({ user_id: userId, value }),
  });

export const removeCommentVote = (commentId: string, userId: string) =>
  apiFetch<void>(`/comments/${commentId}/vote/${userId}`, { method: "DELETE" });

// Badges
export const getBadges = () => apiFetch<Badge[]>("/badges");

export const getBadge = (id: string) => apiFetch<Badge>(`/badges/${id}`);

export const createBadge = (data: { name: string; description?: string; icon_url?: string }) =>
  apiFetch<Badge>("/badges", { method: "POST", body: JSON.stringify(data) });

export const updateBadge = (id: string, data: Partial<Badge>) =>
  apiFetch<Badge>(`/badges/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteBadge = (id: string) =>
  apiFetch<void>(`/badges/${id}`, { method: "DELETE" });

// Notifications
export const getNotifications = (params?: { user_id?: string; type?: string; is_read?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.user_id) query.set("user_id", params.user_id);
  if (params?.type) query.set("type", params.type);
  if (params?.is_read !== undefined) query.set("is_read", String(params.is_read));
  return apiFetch<Notification[]>(`/notifications?${query}`);
};

export const getNotification = (id: string) => apiFetch<Notification>(`/notifications/${id}`);

export const createNotification = (data: {
  user_id: string;
  type: string;
  reference_id: string;
  message: string;
}) => apiFetch<Notification>("/notifications", { method: "POST", body: JSON.stringify(data) });

export const updateNotification = (
  id: string,
  data: Partial<{ type: string; reference_id: string; message: string; is_read: boolean }>
) => apiFetch<Notification>(`/notifications/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const markNotificationRead = (id: string) =>
  apiFetch<void>(`/notifications/${id}/read`, { method: "POST" });

export const markAllNotificationsRead = (userId: string) =>
  apiFetch<void>("/notifications/read-all", { method: "POST", body: JSON.stringify({ user_id: userId }) });

export const deleteNotification = (id: string) =>
  apiFetch<void>(`/notifications/${id}`, { method: "DELETE" });

// Feed endpoints
export const getRecentTopics = () => apiFetch<Topic[]>("/feed/recent-topics");

export const getPopularTopics = () => apiFetch<Topic[]>("/feed/popular-topics");

// Search
export const search = (q: string) => apiFetch<SearchResults>(`/search?q=${encodeURIComponent(q)}`);

// Authentication with JWT
export const loginUser = (email: string, password: string) =>
  apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    authenticated: false,
  });

export const registerUser = (data: { email: string; password: string; handle: string; display_name: string }) =>
  apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    authenticated: false,
  });

export const verifyToken = () =>
  apiFetch<{ valid: boolean; user: User; profile: Profile; roles: Role[] }>("/auth/verify");

// Roles
export const getRoles = () => apiFetch<Role[]>("/roles");

export const getRole = (id: string) => apiFetch<Role>(`/roles/${id}`);

export const createRole = (data: { name: string; description?: string }) =>
  apiFetch<Role>("/roles", { method: "POST", body: JSON.stringify(data) });

export const updateRole = (id: string, data: Partial<Role>) =>
  apiFetch<Role>(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteRole = (id: string) =>
  apiFetch<{ success: boolean }>(`/roles/${id}`, { method: "DELETE" });

// User Roles
export const getUserRolesAll = () => apiFetch<UserRole[]>("/user-roles");

export const assignUserRole = (userId: string, roleId: string) =>
  apiFetch<UserRole>("/user-roles", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role_id: roleId }),
  });

export const removeUserRole = (userId: string, roleId: string) =>
  apiFetch<{ success: boolean }>("/user-roles", {
    method: "DELETE",
    body: JSON.stringify({ user_id: userId, role_id: roleId }),
  });

// User Badges
export const getUserBadgesAll = () => apiFetch<UserBadge[]>("/user-badges");

export const assignUserBadge = (userId: string, badgeId: string) =>
  apiFetch<UserBadge>("/user-badges", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, badge_id: badgeId }),
  });

export const removeUserBadge = (userId: string, badgeId: string) =>
  apiFetch<{ success: boolean }>("/user-badges", {
    method: "DELETE",
    body: JSON.stringify({ user_id: userId, badge_id: badgeId }),
  });

// Site Settings
export const getSiteSettings = () => apiFetch<SiteSettings>("/site-settings", { authenticated: false });

export const updateSiteSettings = (data: Partial<SiteSettings>) =>
  apiFetch<SiteSettings>("/site-settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const toggleMaintenanceMode = (enabled: boolean) =>
  apiFetch<{ maintenance_mode: boolean }>("/site-settings/maintenance", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });

export const updateTopBanner = (data: { top_banner_icon?: string; top_banner_colour?: string; top_banner_text?: string }) =>
  apiFetch<SiteSettings>("/site-settings/top-banner", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const clearTopBanner = () =>
  apiFetch<SiteSettings>("/site-settings/top-banner", { method: "DELETE" });
