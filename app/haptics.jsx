

import React from 'react';


var HapticsJS = React.createClass({

	propTypes: {
		frequency: React.PropTypes.number.isRequired,		
		vibrator: React.PropTypes.bool,
		playing: React.PropTypes.bool
			},

 


	render: function() {
		if(this.props.vibrator && this.props.playing ){
			console.log("vibrando!");
			console.log(this.props.frequency);
			navigator.vibrate(this.props.frequency);
		}
		return <div id="haptics"></div>

	}

});


module.exports = HapticsJS;