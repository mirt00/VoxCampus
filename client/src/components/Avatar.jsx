export default function Avatar({ user, size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0`}>
      {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}
