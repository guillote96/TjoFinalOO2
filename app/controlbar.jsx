
import React from 'react';
import d3 from 'd3';
import Componente from "./decorador/componente";
import Mute from "./decorador/mute";
import Vibrator from "./decorador/vibrator";
import PlayBar from "./decorador/playbar";

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');


var ControlBar = React.createClass({

	propTypes: {
		name : React.PropTypes.string.isRequired,
		playing: React.PropTypes.bool.isRequired,
		vibrator: React.PropTypes.bool.isRequired,
		mute: React.PropTypes.bool.isRequired
		
			},

	getDefaultProps: function() {
	    return {
	      width:'100%',
	      background:'lightgrey',
	      fontSize: "28pt",


	    }
	},


	/**
	* Event handlers
	* 
	*/
	/*_onMuteClick : function (event) {
		PlaybackStore.actions.toggleMute();
	},*/

	/*_onVibratorClick : function (event) {
		PlaybackStore.actions.vibratorMute();
	},*/

	_onPlayClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.togglePlaying();

	},

	_onSkipBackwardClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.skipBackward();
	},

	_onSkipForwardClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.skipForward();
	},

	/**
	* Rendering
	* 
	*/

	render : function() {

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background,
			fontSize:this.props.fontSize,
			className:'unselectable'
		};

		var timeControlStyle  = {
			marginLeft:'auto',
			marginRight:'auto',
			textAlign:'center'
		};

		var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			className:'unselectable'
		};

		var iconText = "fa fa-play";
		if (this.props.playing) {
			iconText = "fa fa-pause";
		}
	
		var m= new Mute(new PlayBar());
		var v= new Vibrator(m);
		var a=v.getEtiqueta();



		return (
            <div className="controlbar" style={divStyle}>
			<div className="time-control" style={timeControlStyle}>
				 <a class="btn" href="#"><i onClick={this._onSkipBackwardClick} className="fa fa-step-backward" style={buttonStyle}></i></a>
				 <a class="btn" href="#"><i onClick={this._onPlayClick} className={iconText} style={buttonStyle}></i></a>
				 <a class="btn" href="#"><i onClick={this._onSkipForwardClick} className="fa fa-step-forward" style={buttonStyle}></i></a>
                 {a.pop()}
				 {a.pop()}
			</div>
		</div>
			);
	}

});

module.exports = ControlBar;