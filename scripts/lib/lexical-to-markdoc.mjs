function escapeText(value) {
  return String(value).replace(/([\\`*_[\]<>])/g, "\\$1");
}

function inline(node, resolveMedia) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") {
    let text = escapeText(node.text ?? "");
    const format = Number(node.format ?? 0);
    if (format & 16)
      text = `\`${String(node.text ?? "").replace(/`/g, "\\`")}\``;
    if (format & 1) text = `**${text}**`;
    if (format & 2) text = `*${text}*`;
    if (format & 4) text = `~~${text}~~`;
    return text;
  }
  if (node.type === "link") {
    const label = childrenInline(node.children, resolveMedia);
    const href = node.fields?.url;
    if (typeof href !== "string" || !href) return label;
    return `[${label}](${href.replace(/\)/g, "\\)")})`;
  }
  if (node.type === "linebreak") return "  \n";
  return childrenInline(node.children, resolveMedia);
}

function childrenInline(children, resolveMedia) {
  return Array.isArray(children)
    ? children.map((child) => inline(child, resolveMedia)).join("")
    : "";
}

function listItemText(node, resolveMedia) {
  if (!Array.isArray(node.children)) return "";
  return node.children
    .map((child) => {
      if (child.type === "paragraph")
        return childrenInline(child.children, resolveMedia);
      return block(child, resolveMedia);
    })
    .filter(Boolean)
    .join("\n");
}

function block(node, resolveMedia) {
  if (!node || typeof node !== "object") return "";
  switch (node.type) {
    case "heading": {
      const level = Number(String(node.tag ?? "h2").slice(1));
      return `${"#".repeat(Math.min(6, Math.max(1, level || 2)))} ${childrenInline(node.children, resolveMedia)}`;
    }
    case "paragraph":
      return childrenInline(node.children, resolveMedia);
    case "quote":
      return childrenInline(node.children, resolveMedia)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "list": {
      const ordered = node.listType === "number" || node.tag === "ol";
      return (node.children ?? [])
        .map(
          (item, index) =>
            `${ordered ? `${Number(node.start ?? 1) + index}.` : "-"} ${listItemText(item, resolveMedia)}`,
        )
        .join("\n");
    }
    case "upload": {
      const media = resolveMedia(node.value);
      return media ? `![${escapeText(media.alt)}](${media.src})` : "";
    }
    case "text":
    case "link":
      return inline(node, resolveMedia);
    default:
      return Array.isArray(node.children)
        ? node.children
            .map((child) => block(child, resolveMedia))
            .filter(Boolean)
            .join("\n\n")
        : "";
  }
}

export function lexicalToMarkdoc(value, resolveMedia) {
  const root = value?.root ?? value;
  if (!root || !Array.isArray(root.children)) return "";
  return root.children
    .map((node) => block(node, resolveMedia))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}
