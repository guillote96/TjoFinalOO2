import Componente from "./componente";
var PlaybackStore = require('../stores/playbackstore.js');

class Decorador extends Componente{


    constructor(unComponente){
      super();
      this.componente=unComponente;
     }

     getComponente(){
         return this.componente;
     }
     

     getEtiqueta(){

        return this.getComponente().getEtiqueta();
     }

}

export default Decorador;