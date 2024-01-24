import fs from "fs";
import csv from "csvtojson";
import { Transform } from "stream";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

const main = async () => {
  /******NOTES: Understanding streaming */
  // We use streams to be able to work with large amounts of data. We can create a stream, read from it, and write our own streams.
  // In the example below, we used {highWaterMark} to control the size of the chunk.
  /************************************ */

  // createReadStream with highWaterMark
  //   const readStream = fs.createReadStream("./data/import.csv", {
  //     highWaterMark: 100,
  //   });

  const readStream = fs.createReadStream("./data/import.csv");

  const writeStream = fs.createWriteStream("./data/export.csv");

  // NOTES: A better alternative than attempting to control our own stream. (node.js controls the flow for us)
  const myTransform = new Transform({
    objectMode: true,
    transform(chunk, enc, callback) {
      const user = {
        name: chunk.name,
        email: chunk.email.toLowerCase(),
        age: Number(chunk.age),
        salary: Number(chunk.salary),
        isActive: chunk.isActive === "true",
      };
      callback(null, user);
    },
  });

  const myFilter = new Transform({
    objectMode: true,
    transform(user, enc, callback) {
      if (!user.isActive || user.salary < 9700) {
        callback(null);
        return;
      }

      callback(null, user);
    },
  });

  const convertToNdJson = new Transform({
    objectMode: true,
    transform(user, enc, callback) {
      const ndjson = JSON.stringify(user) + "\n";
      callback(null, ndjson);
    },
  });

  // Notes: Learning pipeline - Same as below but a bit simpler
  try {
    await pipeline(
      readStream,
      csv({ delimiter: ";" }, { objectMode: true }),
      myTransform,
      myFilter,
      convertToNdJson,
      createGzip(),
      fs.createWriteStream("./data/export.ndjson.gz")
    );
    console.log("stream ended");
  } catch (error) {
    console.error("stream ended with errors");
  }

  // Notes: This would work fine, it's how pipes work in NodeJS
  // readStream
  //   .pipe(csv({ delimiter: ";" }, { objectMode: true }))
  //   .pipe(myTransform)
  //   .pipe(myFilter)
  //   .on("data", (data) => {
  //     console.log(">>>>>>>DATA: ");
  //     console.log(data);
  //   })
  //   .on("error", (err) => {
  //     console.log("Stream error: ", err);
  //   })
  //   .on("end", () => {
  //     console.log("Stream ended");
  //   });

  // NOTES: Event listeners
  // readStream.on("end", () => {
  //   console.log("stream ended");
  // });

  // writeStream.on("finish", () => {
  //   console.log("write stream finished.");
  // });

  //   readStream.on("data", (buffer) => {
  //     console.log(">>>DATA: ");
  //     console.log(buffer.toString());

  //     writeStream.write(buffer);
  //   });

  //   readStream.on("end", () => {
  //     console.log("stream ended");

  //     writeStream.end();
  //   });
};

main();
