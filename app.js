const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer');
const cors = require('cors')
var ffmpeg = require('ffmpeg');
const jimp = require("jimp");
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

if(cluster.isMaster){

  console.log(`Maestro: ${process.pid} esta activo`);

  numNucleos = os.cpus().length;

  for(let i = 0; i < numNucleos; i++){
    cluster.fork();
  }


  cluster.on('exit', (worker, code, signal) => {
    if (signal) {
      console.log(`worker was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(`worker exited with error code: ${code}`);
    } else {
      console.log('worker success!');
    }
});

}else{ 

console.log(`Esclavo: ${process.pid} esta activo`)

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
 
const hostname = '127.0.0.1';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + ".mp4")
    }
  })
   
  var upload = multer({ storage: storage })

//ROUTES WILL GO HERE
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');   
});

const frames = name =>{
  console.log("ejecutando")
  
}



//funciones
const convertir = (name) =>{
  //ffmpeg -framerate 30 -pattern_type glob -i '*.jpg' -c:v libx264 -pix_fmt yuv420p out.mp4

  const { exec } = require('child_process');
      exec(`ffmpeg -r 60 -f image2 -s 1920x1080 -i "./procesados/frames/${name}/${name}_%0d.jpg" -vcodec libx264 -crf 25  -pix_fmt yuv420p test.mp4`, (err, stdout, stderr) => {
      if (err) {
          //some err occurred
          console.error(err)
      } else {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      }
      });
  }


  function procesamiento (carpeta, doc){
    console.log(carpeta)
    console.log(doc)
    console.log("Aplicando filtros...")
    fs.readdir(`./frames/${carpeta}`, (err, files) => {
        console.log(files.length);
        let frames = files.length;
    
        (async function () {
            for(let i = 1;i <= frames; i++) {
    
                //let image = await jimp.read(`/${doc}${i}.jpg`)
                

                if(i == frames)
                {
                  
                  console.log("procesando...")
                  convertir(carpeta)
                }
                else{
                  let image = await jimp.read(`./${doc}${i}.jpg`)
                  image.greyscale();
                  image.write(`./procesados/${doc}${i}.jpg`)
                }
            }
            
        })();
    
    });


    }

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    const name=file.filename.substr(0,file.filename.length - 4)
    console.log(file)
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }

    try {
      var process = new ffmpeg(`./uploads/${file.filename}`);
      console.log(file.filename)
      process.then(function (video) {
          // Callback mode
          video.fnExtractFrameToJPG(`./frames/${name}`, {
              frame_rate: 60,
              number: 150,
              keep_pixel_aspect_ratio : true,
              keep_aspect_ratio: true,
          }, function (error,files){
  
              if(!error)
                  {   

                      console.log(name)

                      procesamiento(name,files[0].substr(0,files[0].length - 5))

                    
                      //console.log(name)

                      //console.log(files[0].substr(1, files[0].length))

                      //console.log(files[0].substr(0,files[0].length - 5))

                      //console.log("se supone que ya")

                      res.send(file.filename)

                  }
  
          });
      }, function (err) {
           console.log('Error: ' + err);
      });
    }
  
      catch (e) {
      console.log(e.code);
      console.log(e.msg);
  }
    
    
  }) 

app.listen(5000, () => console.log('Server started on port 5000'));

}

