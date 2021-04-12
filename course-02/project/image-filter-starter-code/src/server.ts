import express, { Request, Response, Express } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles, getFileNameFromPath } from "./util/util";

(async () => {
  // Init the Express application
  const app: Express = express();

  // Set the network port
  const port: number = +process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Creaye middleware for deleting files cached after success response
  app.use((req: Request, res: Response, next) => {
    res.on("finish", () => {
      // get headers
      const headers: any = res.getHeaders();
      // get filename to delete
      const udacityFilename: string = headers["udacity-filename"];
      if (udacityFilename) {
        // delete file with path prefix
        deleteLocalFiles([`${__dirname}/util/tmp/${udacityFilename}`]);
      }
    });
    next();
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // @TODO1
  // Create endpoint filteredimage, cache image file from a query source
  app.get("/filteredimage", async (req: Request, res: Response) => {
    const { image_url }: { image_url: string } = req.query;
    // validate if query param is not empty
    if (!image_url) {
      return res.status(400).send({ message: "Image url is required!" });
    }

    try {
      // filter image and store it locally
      let imagePath: string = await filterImageFromURL(image_url);

      // response stored image to user as a proxy
      res.status(200).header("udacity-filename", getFileNameFromPath(imagePath)).sendFile(imagePath);
    } catch (message) {
      return res.status(500).send({ message });
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
