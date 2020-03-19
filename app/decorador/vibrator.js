import Decorador from "./decorador";
import React from 'react';
var PlaybackStore = require('../stores/playbackstore.js');

class Vibrator extends Decorador {

    constructor(unComponente){
        super(unComponente);

      }

    render() {
        return (
            <a class="btn" href="#"><span onClick={this.click} className="unselectable mute"><input type="checkbox" checked={this.props.vibrator}/>Vibrator</span></a>
        );
     }

   click (event) {
		  PlaybackStore.actions.vibratorMute();
  	}
    
  
    getEtiqueta(){
       var elem=this.getComponente().getEtiqueta();
       elem.push((<Vibrator></Vibrator>))
       return elem;
     }

     

    




}

export default Vibrator;