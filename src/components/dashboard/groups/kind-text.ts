export const KIND_TEXT = {
  session: { title: "Sessions", one: "session", many: "sessions", other: "User", otherPlural: "users", route: "sessions", otherRoute: "users", search: "Search sessions or users", blurb: "A session groups one conversation's runs together." },
  user: { title: "Users", one: "user", many: "users", other: "Sessions", otherPlural: "sessions", route: "users", otherRoute: "sessions", search: "Search users or sessions", blurb: "Everything one end user did across all their sessions." },
} as const;
