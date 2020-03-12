import Archivo from './archivo';


class Json extends Archivo {
   constructor(main) {
      super();
		super.inicializar("data:text/json;charset=utf8, "+JSON.stringify(main, null, 2),"my_waveform.json",{type: "text/JSON"});
   }


 }
 
 export default Json;