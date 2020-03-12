class Archivo {
     datos;
     blob;
     url;
     name;
     constructor(){
      }

      inicializar(main,name,mime){
          this.datos = main;
		this.blob = new Blob([this.datos], mime);
		this.name=name;
		this.blob.name = this.name;
		this.url = URL.createObjectURL(this.blob);
      }

      getName(){
          return this.name;
      }
    
      getUrl(){
          return this.url;
      }




}

export default Archivo;