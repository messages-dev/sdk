import type { SendContactCardParams } from "./types.js";

const CRLF = "\r\n";

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function pushField(lines: string[], name: string, value: string | undefined) {
  if (value === undefined || value === "") return;
  lines.push(`${name}:${escapeValue(value)}`);
}

function sniffImageType(
  bytes: Uint8Array,
  hint?: "JPEG" | "PNG",
): "JPEG" | "PNG" {
  if (hint) return hint;
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "JPEG";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "PNG";
  }
  return "JPEG";
}

async function encodePhoto(
  photo: Blob | Buffer | Uint8Array | string,
  photoType: "JPEG" | "PNG" | undefined,
): Promise<{ type: "JPEG" | "PNG"; base64: string }> {
  if (typeof photo === "string") {
    return { type: photoType ?? "JPEG", base64: photo };
  }

  let bytes: Uint8Array;
  let hint: "JPEG" | "PNG" | undefined = photoType;

  if (typeof Blob !== "undefined" && photo instanceof Blob) {
    const buf = await photo.arrayBuffer();
    bytes = new Uint8Array(buf);
    if (!hint) {
      if (photo.type === "image/jpeg") hint = "JPEG";
      else if (photo.type === "image/png") hint = "PNG";
    }
  } else {
    bytes = photo as Uint8Array;
  }

  const type = sniffImageType(bytes, hint);
  const base64 = Buffer.from(bytes).toString("base64");
  return { type, base64 };
}

export async function buildVCard(
  params: SendContactCardParams,
): Promise<string> {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  const firstName = params.firstName;
  const lastName = params.lastName;
  lines.push(`N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
  lines.push(`FN:${escapeValue(`${firstName} ${lastName}`.trim())}`);

  pushField(lines, "ORG", params.org);
  pushField(lines, "TITLE", params.title);
  pushField(lines, "URL", params.url);

  if (params.phones) {
    for (const phone of params.phones) {
      const type = (phone.type ?? "cell").toUpperCase();
      lines.push(`TEL;TYPE=${type}:${escapeValue(phone.value)}`);
    }
  }

  if (params.emails) {
    for (const email of params.emails) {
      const prefix = email.type ? `EMAIL;TYPE=${email.type.toUpperCase()}` : "EMAIL";
      lines.push(`${prefix}:${escapeValue(email.value)}`);
    }
  }

  if (params.address) {
    const a = params.address;
    const parts = [
      "", // PO box
      "", // extended address
      escapeValue(a.street ?? ""),
      escapeValue(a.city ?? ""),
      escapeValue(a.region ?? ""),
      escapeValue(a.postalCode ?? ""),
      escapeValue(a.country ?? ""),
    ].join(";");
    const prefix = a.type ? `ADR;TYPE=${a.type.toUpperCase()}` : "ADR";
    lines.push(`${prefix}:${parts}`);
  }

  pushField(lines, "BDAY", params.bday);
  pushField(lines, "NOTE", params.note);

  if (params.photo !== undefined) {
    const { type, base64 } = await encodePhoto(params.photo, params.photoType);
    lines.push(`PHOTO;ENCODING=b;TYPE=${type}:${base64}`);
  }

  lines.push("END:VCARD");
  return lines.join(CRLF);
}
