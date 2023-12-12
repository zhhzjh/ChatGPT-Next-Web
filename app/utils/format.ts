export function prettyObject(msg: any) {
  const obj = msg;
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  if (msg === "{}") {
    return obj.toString();
  }
  if (msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}

export function* chunks(s: string, maxBytes = 1000 * 1000) {
  const decoder = new TextDecoder("utf-8");
  let buf = new TextEncoder().encode(s);
  while (buf.length) {
    let i = buf.lastIndexOf(32, maxBytes + 1);
    // If no space found, try forward search
    if (i < 0) i = buf.indexOf(32, maxBytes);
    // If there's no space at all, take all
    if (i < 0) i = buf.length;
    // This is a safe cut-off point; never half-way a multi-byte
    yield decoder.decode(buf.slice(0, i));
    buf = buf.slice(i + 1); // Skip space (if any)
  }
}

const SEPARATION_REG = /([\.。:\n;])/;
const MESSAGE_MIN_LENGTH = 10;

export const separationMessage = (message: string): string[] => {
  const list = message.split(SEPARATION_REG).filter((str) => str !== "");
  console.log("list:", message, list);
  let messages = [];
  while (list.length > 0) {
    let content = "";
    while (content.length < MESSAGE_MIN_LENGTH && list.length > 0) {
      content += (list.shift() ?? "") + (list.shift() ?? "");
      console.log("join:", content, list);
      while (list.length > 0 && list[0].match(SEPARATION_REG)) {
        content += list.shift() ?? "";
      }
    }
    messages.push(content);
  }
  return messages;
};
