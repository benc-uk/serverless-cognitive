//
// Photo info box
//
Vue.component('infobox', {
  props: ['data'],
  template: '<div class="infobox"><h2>Azure Cognitive Service - Results</h2><pre>{{ data }}</pre></div>'
})


//
// Main photo display component
//
Vue.component('photo', {
  props: ['data'],

  data: function () {
    return {
      id: this.data.requestId,
      image: this.data.srcUrl,
      caption: this.data.description.captions[0].text,
      tags: this.data.tags,
      faces: this.data.faces,
      metadata: this.data.metadata,
      showInfo: false
    };
  },

  template: `<div class="photo">
               <infobox v-if="showInfo" :data="data"></infobox>
               <a @click="infoBoxShow">🛈</a>
               <canvas width="100" height="100" ref="canvas" @click="infoBoxHide"></canvas>
               <img ref="image" :src="image" @load="drawOverlay"/>
             </div>`,
  
  mounted: function() {
    window.addEventListener('resize', this.drawOverlay)
  },

  methods: {
    drawOverlay: function () {
      let width = this.$refs.image.clientWidth;
      let scale = width / this.metadata.width;

      this.$refs.canvas.width = width;
      this.$refs.canvas.height = this.$refs.image.clientHeight;
      var ctx = this.$refs.canvas.getContext('2d');
    
      // Drawing cognitive results over image
    
      // Caption/title
      ctx.font = `${width/26}px 'Tahoma', sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = width / 300; 
      ctx.shadowOffsetX = width / 300; 
      ctx.shadowOffsetY = width / 300;
      ctx.fillStyle = 'white';
      ctx.fillText(toTitleCase(this.caption), 20, (width/30)+10);
    
      // Top three tags
      ctx.fillStyle = '#36c139'; 
      ctx.shadowBlur = width / 600; 
      ctx.shadowOffsetX = width / 600; 
      ctx.shadowOffsetY = width / 600;
      ctx.font = `${width/40}px 'Tahoma', sans-serif`;
      var t = 0;
      for(let tag of this.tags.slice(0, 3)) {
        ctx.fillText(`• ${tag.name} ${(Number.parseFloat(tag.confidence)*100).toFixed(2)}%`, 20, (width/30)+20+(t+=(width/35)));      
      }
    
      // Faces
      ctx.lineWidth = width/180;
      ctx.font = `${width/45}px 'Tahoma', sans-serif`;
      for(let face of this.faces) {
        if(face.gender == 'Male') {
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
          ctx.fillStyle = '#318dd8';
        } else {
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
          ctx.fillStyle = '#db48d3';
        }
        ctx.shadowColor = "transparent";
        ctx.strokeRect(face.faceRectangle.left*scale, face.faceRectangle.top * scale, face.faceRectangle.width * scale, face.faceRectangle.height * scale);  
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)"; 
        ctx.fillText(`${face.gender} ${face.age}`, face.faceRectangle.left * scale - (10 * scale), face.faceRectangle.top * scale - (16 * scale));
      }
    },

    infoBoxShow: function() {
      this.showInfo = true;
    },

    infoBoxHide: function() {
      this.showInfo = false;
    }
  }
})


//
// Loading spinner component
//
Vue.component('spinner', {
  template: '<div id="loader"><img src="img/spinner.gif"/></div>'
})


//
// Settings component
//
Vue.component('settings', {
  data: function() {
    return {
      sa: ''
    }
  },
  
  template: '<div id="settings">Name of your Azure storage account:<br/><input type="text" v-model="sa" @keyup.enter="save"><button @click="save">OK</button></div>',
  
  methods: {
    save: function() {
      if(!this.sa) return;
      var searchParams = new URLSearchParams(window.location.search);
      searchParams.append("sa", this.sa);
      window.location.search = searchParams;
    }
  }
})