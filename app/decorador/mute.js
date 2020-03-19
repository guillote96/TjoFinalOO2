import Decorador from "./decorador";
import React from 'react';
var PlaybackStore = require('../stores/playbackstore.js');


class Mute extends Decorador {
    
  constructor(unComponente){
      super(unComponente);
    }

  click(event) {
		PlaybackStore.actions.toggleMute();
	}
  
  render() {
    return (
      <a class='btn' href='#'><span onClick={this.click} className='unselectable mute'><input type='checkbox' checked={this.props.mute}/>Mute</span></a>
    );
 }

  getEtiqueta(){
        var elem=this.getComponente().getEtiqueta();
        elem.push((<Mute></Mute>))
        return elem;
   }

}


export default Mute;