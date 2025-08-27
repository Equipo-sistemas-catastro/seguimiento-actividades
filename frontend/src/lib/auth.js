const KEY = "token";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(KEY);

export const setToken = (t) => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, t);
};

export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
};
