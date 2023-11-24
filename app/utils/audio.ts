export async function covertAudio(
  file: Blob,
  outputFileExtension: string = "mp3",
): Promise<Blob> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  console.log("load file");
  const inputName = "input.webm";
  const outputName = `output.${outputFileExtension}`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  await ffmpeg.exec(["-i", inputName, outputName]);

  const outputData = await ffmpeg.readFile(outputName);
  const outputBlob = new Blob([outputData], {
    type: `audio/${outputFileExtension}`,
  });

  return outputBlob;
}
