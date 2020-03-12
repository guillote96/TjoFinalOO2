import Archivo from './archivo';
class Texto extends Archivo {
     constructor(main){
       super();
       super.inicializar("data:text/plain;charset=utf8, " + this.armarTexto(main["parameters"]["frequency"]["data"],main["duration"]),"my_waveform.txt",{type: "text/plain"});
     }

     armarTexto(data,duration){
         var txt='Frecuency: [';
        data.forEach(element => {

           txt=txt +' '+ Math.trunc(element["value"]);
            
        });
        txt="\r \n "+txt+" ]\r \n"+'Duration :'+' '+duration;
        return txt;
     }




}

export default Texto;
