import Reflux from 'reflux';
var VTIconStore = require('./vticonstore.js');
var LogStore = require('./logstore.js');
import Json from "./../clases/json";






import {transform} from './../../thirdparty/fft.js';
import Wav from '../clases/wav';
import Texto from '../clases/texto';

var saveLoadActions = Reflux.createActions(
	[
		'save',
		'loadMacaronFile'
	]
);


var saveLoadStore = Reflux.createStore({

	listenables: [saveLoadActions],

	onSave() {


		// Here you can specify how you'd like the files to be named

		var closeSaveWindow = function() {
			document.body.removeChild(linksContainer);
			document.body.removeChild(shadow);
		}

		/**
		 * Creating the Pop-Up Style Container for Download Links
		 */
		var linksContainer = document.createElement("div");
		linksContainer.style="text-align:left";
		linksContainer.id = "save-links-container";
		linksContainer.classList.add("save-link-container");

		var closeLink = document.createElement("a");
		closeLink.id = "save-link-close-button";
		closeLink.classList.add("close");
		closeLink.innerHTML = "X";
		closeLink.addEventListener("click", function() {closeSaveWindow();});

		var linksHeader = document.createElement("H2");
		linksHeader.id = "save-link-header";
		linksHeader.classList.add("links-header");
		linksHeader.innerHTML = "Save Your Macaron Waveform";

		var shadow = document.createElement("div");
		shadow.id = "links-box-shadow";
		shadow.classList.add("link-box-shadow");


		/**
		 *  Creating the JSON file for download
		 */

		var json= new Json(VTIconStore.store.getInitialState()["main"]);

		var jsonDownloadLink = document.createElement("a");
		jsonDownloadLink.id = "json-download-link";
		jsonDownloadLink.classList.add("download-link");
		jsonDownloadLink.setAttribute("value", "Download");
		jsonDownloadLink.setAttribute("href", json.getUrl());
		jsonDownloadLink.setAttribute("download", json.getName());
		jsonDownloadLink.innerHTML = "download Macaron file (JSON)";

        
        /**
         *  Creating the WAV file for download
         */
		var wav= new Wav(VTIconStore.store.getInitialState()["main"]);

		var wavDownloadLink = document.createElement("a");
		wavDownloadLink.id = "wav-download-link";
		wavDownloadLink.classList.add("download-link");
		wavDownloadLink.setAttribute("value", "Download");
		wavDownloadLink.setAttribute("href", wav.getUrl());
		wavDownloadLink.setAttribute("download", wav.getName());
		wavDownloadLink.innerHTML = "download Waveform File (WAV)";

		

        
        /**
         *  Creating the Text Plane file for download
		 * 
         * */
		var text= new Texto(VTIconStore.store.getInitialState()["main"]);

		var textDownloadLink = document.createElement("a");
		textDownloadLink.id = "text-download-link";
		textDownloadLink.classList.add("download-link");
		textDownloadLink.setAttribute("value", "Download");
		textDownloadLink.setAttribute("href", text.getUrl());
		textDownloadLink.setAttribute("download", text.getName());
		textDownloadLink.innerHTML = "download Textform File (TEXT)";


		/**
		 * And add the Safari note (hopefully this will be resolved soon...)
		 */
		var safariNote = document.createElement("p");
		safariNote.id = "safari-note";
		safariNote.classList.add("download-link");
		safariNote.innerHTML = "* Note: The download links will open in a new tab if you are using the Safari web browser. To download directly, please try again in the Chrome, Firefox, or IE web browsers.";

		/**
		 * Now just append it all together!
		 */
		linksContainer.appendChild(closeLink);
		linksContainer.appendChild(linksHeader);

		var spacer = document.createElement("br");
		var linksText = document.createElement("p");

		linksText.id = "links-text";
		linksText.appendChild(spacer);
		linksText.appendChild(jsonDownloadLink);
		linksText.appendChild(spacer);
		linksText.appendChild(wavDownloadLink);
		linksText.appendChild(spacer);
		linksText.appendChild(textDownloadLink);
		linksText.appendChild(spacer);
		linksText.appendChild(safariNote);
		linksContainer.appendChild(linksText);
		document.body.appendChild(linksContainer);
		document.body.appendChild(shadow);

	},

	onLoadMacaronFile(file) {
		var reader = new FileReader();
		reader.filename = file.name;

		// Case 1: It's a WAV file...
		if (reader.filename.indexOf('.wav') >= 0) {
			reader.onload = function(e) {
				var waveData = reader.result;
				if(isWAVFile(reader, reader.filename)) {
					loadWAVFile(reader);
				}	else {
					alert('The selected file wasnt one that Macaron recognizes');
				}
			}

			reader.readAsArrayBuffer(file);
		}

		// Case 2: It's a JSON File or something else...
		else {
			reader.onload = function(e) {
				var waveData = reader.result;
				if (isJSONFile(reader, reader.filename)) {
					VTIconStore.actions.setVTIcon(JSON.parse(waveData.slice(29)), "main");
				} else {
					alert('The selected file wasnt one that Macaron recognizes. Please upload an appropriate WAV or JSON file.');
				}
			}

			reader.readAsText(file); //assumes 'utf8'
		}
	}
});



 /**
  *  getCurrentFrequency computes what the current frequency should be at
	*   time t based on the users keyframes created in the "Frequency"
	*    pane of the Macaron editor.
	*
	* @param t a number representing current time in miliseconds
	* @param freqData a JSON object created by the VTIconStore for
	*          frequency keyframes.
	*
	* @return a number representing the intended frequency at time t
	**/
var getCurrentFrequency = function(t, freqData) {

	// First find the frequency at time t...
	var frequency = 0;

	for (var j=0; j<freqData.length; j++) {

		if ((t <= freqData[0].t) && (j == 0)) {
			frequency = freqData[j].value;

		} else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {
			var df = freqData[j].value - freqData[j-1].value;
			var dt = freqData[j].t - freqData[j-1].t;
			frequency = freqData[j-1].value + ((t - freqData[j-1].t)*(df/dt));

		} else {
			frequency = freqData[j].value;
		}

	}

	return frequency;

}

/**
 *  the Equalize function will scale the volume to adjust for "sweet-spots"
 *   in a given actuator. This code exactly emulates the algorithm in
 *    soundgen.jsx written by Oliver.
 *
 * @param t a number representing current time in miliseconds
 * @param freqData a JSON object created by the VTIconStore for
 *          frequency keyframes.
 * @param volume a number representing the current volume (y range * amplitude)
 *
 * @return a number representing the adjusted volume.
 **/
var equalize = function(t, freqData, volume) {

	// First find the frequency at time t...
	var frequency = getCurrentFrequency(t, freqData);

	// Now scale it...
	var pf = 0;
	var scaleFactor = 1;
	if (frequency < 300) {
		pf = (frequency - 50) / 250; // proportion of way btwn 50 and 300
		scaleFactor = pf * 4 + 1; // proportion of gain difference, here 24
	} else {
		pf = (frequency - 300) / 200; // proportion of way btwn 300 and 550
		scaleFactor = ((1 - pf) * 3) + 2; // proportion of gain difference
	}

	var equalizedVolume = volume / scaleFactor;

	return equalizedVolume;
}


/**
 *  isJSONFile determines if the provided file is, in fact, a JSON file
 *   that can be understood by the Macaron app.
 *
 * @param r a JS Reader produced by the Filereader API when a file is loaded.
 * @param fn a string representing the name of the uploaded file.
 *
 * @return a boolean, True if file is useable JSON, False otherwise.
 **/
var isJSONFile = function(r, fn) {

	var fileExtOK = (fn.indexOf('.json') >= 0);

	try {
		var test = JSON.parse(r.result.slice(29));
		var fileContentOK = true;
	}
	catch(err) {
		var fileContentOK = false;
	}

	console.log(fileExtOK); console.log(fileContentOK);

	var fileOK = fileExtOK && fileContentOK;

	return(fileOK);
}



/**
 * isWavFile determines whether or not a provided file is actually an
 *  appropriate WAV file (with readable bit-depth, correct file format,
 *   useful number of channels, etc.)
 *
 * @param r a JS Reader produced by the Filereader API with a file is loaded.
 * @param fn a string representing the name of the uploaded file.
 *
 * @return a boolean, True if the file is a WAV file, False otherwise.
 **/
var isWAVFile = function(r, fn) {

	var result = false;
	var wavedata = new DataView(r.result);

	var header = String.fromCharCode(wavedata.getInt8(0));  //R
	header +=    String.fromCharCode(wavedata.getInt8(1));  //I
	header +=    String.fromCharCode(wavedata.getInt8(2));  //F
	header +=    String.fromCharCode(wavedata.getInt8(3));  //F
	header +=    String.fromCharCode(wavedata.getInt8(8));  //W
	header +=    String.fromCharCode(wavedata.getInt8(9));  //A
	header +=    String.fromCharCode(wavedata.getInt8(10)); //V
	header +=    String.fromCharCode(wavedata.getInt8(11)); //E

	// Make sure we're actually looking at a WAV file.
	var headerOK = (header == "RIFFWAVE");
	var fileExOK = (fn.indexOf('.wav') >= 0);

	if (headerOK && fileExOK) {
		result = true;
	}

	return result;
}



/**
 *  loadWAVFile takes the contents of a WAV file and loads an approximation
 *   of that file's waveform into the Macaron editor. This function relies
 *    heavily on the code written by the amazing Benson!
 *
 * @param r a JS Reader created by the Filereader API when a file is loaded.
 **/
var loadWAVFile = function(r) {

	var y;  // speaker displacement at time = t

	var sampleRate;
	var duration;
	var nChannels;
	var nFrames;
	var wavedata = r.result;

	var AudioCtx = new (window.AudioContext || window.webkitAudioContext)();

	AudioCtx.decodeAudioData(wavedata, function(buff) {
		sampleRate = buff.sampleRate;
		duration = buff.duration;
		nChannels = buff.numberOfChannels;
		nFrames = buff.length;

		var waveBuffer = new Array(nFrames);
		waveBuffer = buff.getChannelData(0); // Yup, just one channel...

		var nPannels = 80; // The number of points at which the input is to
											 // be estimated. (MUST BE DIVISIBLE BY 20).
		var pannelDuration = (duration * 1000) / nPannels; // in ms
		var pannelWidth = Math.round(nFrames / nPannels); // in number of frames

		for (var i=0; i<nPannels; i++) {

			var jMin = Math.round(pannelWidth * i);
			var jMax = Math.round(pannelWidth * (i + 1));

			var tMid = ((i*1000*duration)/nPannels)+((500*duration)/nPannels);

			var waveChunk = waveBuffer.slice(jMin, jMax);

			var aVal = Math.max.apply(null, waveChunk);

			var fVal = findFFTRoot(waveChunk, sampleRate);


			VTIconStore.actions.newKeyframe("amplitude", tMid, aVal, false, "main");
			VTIconStore.actions.newKeyframe("frequency", tMid, fVal, false, "main");
		}

		VTIconStore.actions.unselectKeyframes("main");
		VTIconStore.actions.addSelectedKeyframes([0,1], "main");
		VTIconStore.actions.deleteSelectedKeyframes("main");
	});
}

/**
 *  findFFTRoot computes the Discrete Fourier Transform of the audio data,
 *   and takes the frequency with the largest weight to be the approximated
 *    frequency of the entire data chunk. This function relies on the "fft"
 *     javascript functions found in the Third Party directory.
 *
 * @param data an array of y values decoded from a WAV file.
 * @param sampleRate a number representing the sample rate of the wave data.
 *
 * @return a number reresenting a best guess at the frequency
 *          of the wave in the data.
 **/
var findFFTRoot = function(data, sampleRate) {
	var real = new Array(data.length);
	var imag = new Array(data.length);

	for (var i=0; i<data.length; i++){
		real[i] = data[i]; imag[i] = 0;
	}

	transform(real, imag);
	// "transform" comes from the fft utility in the thirdparty directory.

	for (var i=0; i<data.length; i++) {
		real[i] = Math.abs(real[i]);
	}

	var halfReal = new Array(Math.round(data.length / 2));
	for (var i=0; i<data.length/2; i++) {
		halfReal[i] = real[i];
	}

	var fftRootLocation = real.indexOf(Math.max.apply(null, halfReal));

	var Fs = new Array(data.length);
	for (var i=1; i<=data.length; i++) {
		Fs[i] = i * sampleRate/data.length;
	}

	return Math.round(Fs[fftRootLocation]); //stub
}




module.exports = {
	actions:saveLoadActions,
	store:saveLoadStore
};
