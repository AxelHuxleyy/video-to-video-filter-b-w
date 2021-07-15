const ffmpeg = require('ffmpeg');
const fs =  require ('fs')



console.log("hola")


const existe = () =>{
  try {
    fs.statSync('test.mp4');
    console.log('file or directory exists');
    return true
  }
  catch (err) {
  if (err.code === 'ENOENT') {
    console.log('file or directory does not exist');
  }
  console.log(err)
  return false
  }
}


const ejecutar =  () =>{
  if(existe()){
    console.log("ya existe")
    return true
  }else{
    setTimeout(() => {
      console.log("checando...")
      ejecutar()
    }, 3000);

  }
}

const respuesta=()=>{
  if(ejecutar()){
    console.log("ya salio")
  }
  else{
    console.log("salio por donde no deberia")
  }
}

respuesta();