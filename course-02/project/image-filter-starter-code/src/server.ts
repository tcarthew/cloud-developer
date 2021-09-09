import express, { json } from 'express';
import { filterImageFromURL, deleteLocalFiles, isError } from './util/util';

const URL_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig;

(async () => {
  const app = express();
  const port = process.env.PORT || 8082;
  
  app.use(json());

  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{valid url to jpg image}}")
  } );

  app.get('/filteredimage', async (req, res) => {
    const url = req.query.image_url;

    if (!url) {
      return res
        .status(400)
        .send({ message: 'image_url query parameter is required' });
    }

    if (!URL_REGEX.test(url)) {
      return res
        .status(400)
        .send({ message: 'image_url is should be a valid url' });
    }

    let result: string;
    try {
      console.log('filtering : ', url);
      result = await filterImageFromURL(url);

      return res
        .status(200)
        .sendFile(result, (err) => {
          if (err) {
            return res.status(500).send({ message: err.message  });
          }

          if (result) {
            deleteLocalFiles([result]);
          }
        });
    } catch (err) {
      const message = isError(err) ? err.message : 'Unknown';
      res.status(500).send({ message });
    }
  });
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();