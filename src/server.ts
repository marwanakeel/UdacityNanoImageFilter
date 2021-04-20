import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  
  app.get( "/filteredimage", async (req, res ) => {
    var files_to_process:string[] = new Array(); 
    try{
      let { image_url } = req.query;
      if ( !image_url ) {
        return res.status(400)
                  .send(`image_url is required`);
      }
      const {StringUtils} = require('turbocommons-ts');
      if(!StringUtils.isUrl(image_url)){
        return res.status(422)
                  .send(`image_url is not a valid link`);
      }
      const filteredpath = await filterImageFromURL(image_url);
      files_to_process.push(filteredpath);      
      return res.status(200).on('close', function(){deleteLocalFiles(files_to_process)}).sendFile(filteredpath);
    }
    catch(err){
      return res.status(500).on('close', function(){deleteLocalFiles(files_to_process)}).send({err, msg:"Error While Processing the image"});
    }
    
  } );
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();