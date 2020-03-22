import Decorador from "./decorador";
import React from 'react';
import PlayBar from "./playbar";
var PlaybackStore = require('../stores/playbackstore.js');
var VTIconStore = require('../stores/vticonstore.js');

class Vibrator extends Decorador {

    constructor(unComponente){
        super(unComponente);


      }


    render() {
        return (
            <a class="btn" href="#"><span onClick={this.click} className="unselectable mute"><input type="checkbox" checked={Vibrator.props.vibrator}/>Vibrator</span></a>
        );
     }

   click (event) {
      PlaybackStore.actions.vibrator();
      Vibrator.props.vibrator=!Vibrator.props.vibrator;
  	}
    
  
    getEtiqueta(){
       var elem=this.getComponente().getEtiqueta();
       elem.push((<Vibrator></Vibrator>))
       return elem;
     }


     

    




}
Vibrator.props= {
  vibrator: React.PropTypes.bool}

export default Vibrator;