// Client-side anonymous session ID (not a real IP hash — that's done server-side)
// Used only to track voted state in localStorage
export const getAnonId = () => {
  let id = localStorage.getItem("anonId");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("anonId", id);
  }
  return id;
};
