import Decorador from "./decorador";
import React from 'react';
var PlaybackStore = require('../stores/playbackstore.js');


class Mute extends Decorador {
  constructor(unComponente){
      super(unComponente);

    }

  click(event) {
    PlaybackStore.actions.toggleMute();
    Mute.props.mute=!Mute.props.mute;
  }
  
  
  render() {
    return (
      <a class='btn' href='#'><span onClick={this.click} className='unselectable mute'><input type='checkbox' checked={Mute.props.mute}/>Mute</span></a>
    );
 }

  getEtiqueta(){
        var elem=this.getComponente().getEtiqueta();
        elem.push((<Mute></Mute>))
        return elem;
   }

}
Mute.props= {
  mute: React.PropTypes.bool}

export default Mute;