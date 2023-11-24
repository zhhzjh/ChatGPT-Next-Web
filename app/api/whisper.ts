import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
// import { NextApiRequest } from "next";
// import formidable from "formidable";
import { getOpenai } from "./auth";

/* export const config = {
  api: {
    bodyParser: false,
  },
}; */

/* type EnhancedFile = formidable.File & {
  name: string;
  toStream: () => fs.ReadStream;
  toBuffer: () => Promise<Buffer>;
  destroy: () => Promise<void>;
}; */

/**
 * Asynchronous wrapper around formidable
 * which parses the request body and attaches all files and fields from a `multipart/form-data` request
 * to the request object as `req.files` (`req.file`) or `req.fields`.
 * files and files are flattened into a single entry
 * @param req The request object
 * @returns the files
 */
/* function parseForm(req: NextApiRequest, options?: formidable.Options) {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    throw new Error("Invalid Content-Type Header");
  }
  return new Promise<{
    files: EnhancedFile[];
    fields: Record<string, string>;
  }>((resolve, reject) => {
    formidable(options).parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      const parsedFiles: EnhancedFile[] = Object.entries(files).map(
        ([name, file]) => {
          const singleFile = Array.isArray(file) ? file[0] : file;
          return {
            ...singleFile,
            name,
            toBuffer: () => fs.promises.readFile(singleFile.filepath),
            toStream: () => fs.createReadStream(singleFile.filepath),
            destroy: () =>
              // we just ignore the error here because if the file doesn't exist,
              // we don't need to delete it anymore
              fs.promises.unlink(singleFile.filepath).catch(() => {}),
          };
        },
      );
      const parsedFields = Object.entries(fields).reduce<
        Record<string, string>
      >((acc, [name, value]) => {
        acc[name] = Array.isArray(value) ? value[0] : value;
        return acc;
      }, {});

      return resolve({ files: parsedFiles, fields: parsedFields });
    });
  });
} */

/* export default withFileUpload(async (req, res) => {
  const file = req.file;
  console.log("withFileUpload:", req.body);
  if (!file) {
    res.status(400).send("No file uploaded");
    return;
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", createReadStream(file.filepath), "audio.wav");
  formData.append("model", "whisper-1");
  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    },
  );

  const { text, error } = await response.json();
  if (response.ok) {
    res.status(200).json({ text: text });
  } else {
    console.log("OPEN AI ERROR:");
    console.log(error.message);
    res.status(400).send(new Error());
  }
}); */

export async function requestWhisper(req: NextRequest) {
  const openai = getOpenai(req);
  const form = await req.formData();
  const audio = form.get("file") as Blob;
  let fileName = "audio.wav";
  switch (audio.type) {
    case "audio/wav":
      fileName = "audio.wav";
      break;
    case "audio/mp3":
      fileName = "audio.mp3";
      break;
    case "audio/mp4":
      fileName = "audio.mp4";
      break;
    case "audio/webm":
      fileName = "audio.webm";
      break;
    default:
      throw new Error("Unsupported audio format");
  }
  const filePath = `/var/tmp/${fileName}`;
  const audioBuffer = await audio.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(new Uint8Array(audioBuffer)));
  console.log("audio:", audio.type, filePath);
  // console.log("createReadStream:", createReadStream("audio.webm"));
  // const stream = createReadStream((audio as File).name);
  const res = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });

  console.log("requestWhisper:", res);
  // to prevent browser prompt for credentials
  const newHeaders = new Headers();
  newHeaders.delete("www-authenticate");
  // to disable nginx buffering
  newHeaders.set("X-Accel-Buffering", "no");
  if (res?.text) {
    return NextResponse.json({ body: res.text }, { status: 200 });
  } else {
    return NextResponse.json({ body: "input error" }, { status: 404 });
  }
}
