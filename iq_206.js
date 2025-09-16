import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

localStorage.removeItem("pocketbase_auth");
let exporter;
let journey;
var user = "";
function updateJourney(step) {
  journey += step + ', \n';
  var message = {
  "customer_journey": journey
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
}
console.clear();

//ERROR HANDLING


class GlobalErrorSystem {
    constructor() {
        this.errors = new Map(); // Store errors by unique ID
        this.container = null;
        this.initialized = false;
        this.init();
     
    }

    init() {
        if (this.initialized) return;
        
        // Create the error container HTML structure
        this.createErrorContainer();
        this.initialized = true;
    }

    createErrorContainer() {
        // Create the main error container
        const errorContainer = document.createElement('div');
        errorContainer.id = 'global-error-container';
        errorContainer.className = 'error-container hidden';
        
        errorContainer.innerHTML = `
            <div class="error-list" id="error-list">
                <!-- Error messages will be dynamically added here -->
            </div>
        `;

        
        
        // Insert the container into the page (adjust selector as needed)
        const targetParent = document.getElementById('error-parent'); // or wherever you want to place it
        targetParent.appendChild(errorContainer);
        
        this.container = errorContainer;
    }
// Add a new error
    addError(id, title, description, buttonConfig = null, highlight = null) {
        // Check if error already exists - if so, don't add duplicate
        if (this.errors.has(id)) {
            //$('.'+id).not(':first').remove();
            console.log(this.errors)
            return id;
        }

        const errorElement = document.createElement('div');
        errorElement.className = 'error-item ' + id;
        errorElement.dataset.errorId = id;
        
        let buttonHTML = '';
        if (buttonConfig) {
        buttonHTML = `<button class="error-button" data-error-id="${id}">${buttonConfig.text}</button>`;
        }
        let highlightElement = null;
        if(highlight) {
          $(highlight).addClass('error');
          highlightElement = highlight;
        }

        errorElement.innerHTML = `
            <div class="error-header">
                <div class="error-icon"></div>
                <div class="error-title">${title}</div>
            </div>
            <div class="error-content">
                <p>${description}</p>
                ${buttonHTML}
            </div>
        `;
      // Store in our errors map
        this.errors.set(id, {
            element: errorElement,
            title: title,
            description: description,
            buttonConfig: buttonConfig,
            expanded: false,
            highlight: highlightElement
        });
        // Add click handler for expand/collapse
        errorElement.addEventListener('click', (e) => {
            // Don't toggle if a button was clicked
            if (e.target.classList.contains('error-button')) {
                e.stopPropagation();
                this.handleButtonClick(id, buttonConfig);
                return;
            }
            this.toggleError(id);
        });

        // Add to the list (new errors go to the bottom)
        const errorList = document.getElementById('error-list');
        errorList.appendChild(errorElement);

        


        // Show container if it was hidden
        this.showContainer();

        // Remove the 'new' class after animation
        

        return id;
    }
    handleButtonClick(errorId, buttonConfig) {
        if (buttonConfig && typeof buttonConfig.onClick === 'function') {
            buttonConfig.onClick(errorId);
        }
    }
    // Remove an error
    removeError(id) {
        const error = this.errors.get(id);
        if (!error) return false;

        const errorElement = error.element;
        if(error.highlight) {
          $(error.hightlight).removeClass('error');
        }

        // Remove from DOM after animation
        
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
            this.errors.delete(id);

            // Hide container if no errors remain
            if (this.errors.size === 0) {
                this.hideContainer();
            }
       

        return true;
    }

    // Toggle error expansion
    toggleError(id) {
        const error = this.errors.get(id);
        if (!error) return;

        error.expanded = !error.expanded;
        
        if (error.expanded) {
            error.element.classList.add('expanded');
        } else {
            error.element.classList.remove('expanded');
        }
    }

    // Clear all errors
    clearAllErrors() {
        Array.from(this.errors.keys()).forEach(id => {
            this.removeError(id);
        });
    }

    // Show the error container
    showContainer() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    // Hide the error container
    hideContainer() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    // Check if an error exists
    hasError(id) {
        return this.errors.has(id);
    }

    // Get error count
    getErrorCount() {
        return this.errors.size;
    }

    // Update an existing error
    updateError(id, title, description) {
        const error = this.errors.get(id);
        if (!error) {
            // If error doesn't exist, create it
            return this.addError(id, title, description);
        }

        // Update the content
        const titleElement = error.element.querySelector('.error-title');
        const contentElement = error.element.querySelector('.error-content p');
        
        if (titleElement) titleElement.textContent = title;
        if (contentElement) contentElement.textContent = description;

        // Update stored data
        error.title = title;
        error.description = description;

        return id;
    }
}
// Create global instance
const globalErrorSystem = new GlobalErrorSystem();

// Global convenience functions
function addError(id, title, description, buttonConfig = null, highlight = null) {
    return globalErrorSystem.addError(id, title, description, buttonConfig, highlight);
}

function removeError(id) {
    return globalErrorSystem.removeError(id);
}

function updateError(id, title, description) {
    return globalErrorSystem.updateError(id, title, description);
}

function clearAllErrors() {
    return globalErrorSystem.clearAllErrors();
}

function hasError(id) {
    return globalErrorSystem.hasError(id);
}

function getErrorCount() {
    return globalErrorSystem.getErrorCount();
}


//END ERROR HANDLING

var sandbox = document.getElementById('sandbox');
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, sandbox.offsetWidth / sandbox.offsetHeight, .1, 1000);

camera.position.set(-3, 5, 20).setLength(50);
camera.lookAt(new THREE.Vector3(0,0,0));
let renderer = new THREE.WebGLRenderer({
  antialias: true
});
exporter = new STLExporter();
renderer.shadowMap.enabled = true;
renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
renderer.setClearColor(0xffffff, 0);
renderer.setAnimationLoop( animationLoop );
sandbox.appendChild(renderer.domElement);
window.addEventListener("resize", event => {
  camera.aspect = sandbox.offsetWidth / sandbox.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
})

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = .5;
controls.maxDistance = 250;
var light = new THREE.DirectionalLight( 'white', 1.5 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
controls.minDistance = .5;
controls.maxDistance = 200;

const amb = new THREE.AmbientLight( 'white', 3 ); // soft white light
scene.add( amb );
light.position.setScalar(1);
light.castShadow = true;
scene.add(light);


$(".updater").on('change', function(e) {
const target = e.target.id.includes('RANGE') ? e.target.id :  e.target.id.replace('-RANGE','');
const pair = e.target.id.includes('RANGE') ? e.target.id.replace('-RANGE','') : e.target.id + '-RANGE';
if($("#"+e.target.id).hasClass('dim')) {

var step = Number($("#" + e.target.id).attr('step'));
if(step.toString().includes('.')) {
var dec = step.toString().split('.')[1].length;
} else {
var dec = step.toString().length;
}
var value = (Math.round($("#" + e.target.id).val() / step) * step).toFixed(dec);

  $("#" + e.target.id).val(value)
	$('#'+pair).val(value);
} else if($("#"+e.target.id).hasClass('cone-dim')) {
  var value = $("#" + e.target.id).val();
  $("#" + e.target.id).val(value)
	$('#'+pair).val(value);
}
});


const gui = new GUI();
var params = {
      Diameter: 4,
      Length: 10,
      distConeAng: 30,
      distTailOd: 2,
      distTailID: 1.5,
      distTailLen: 10,
      proxConeAng: 30,
      proxTailOd: 2,
      proxTailID: 1.5,
      proxTailLen: 10,
      proxCurve: false,
      distCurve: false,
      WT: 0.015,
      radius: 0.2,
      takeScreenshot: takeScreenshot,
      exportBinary: exportBinary,
      sphereColor: "#333"
}

function preventImpossible() {
  if ( $("#unit").val() == 'mm' ) {
    var conversion = 1;
  } else {
    var conversion = 0.03937;
  }
  if (Number($("#DIAMETER").val()) < Math.min(Number($("#DIST-OD").val()), Number($("#PROX-OD").val())) + (1*conversion)) { 
    $("#DIAMETER, #DIAMETER-RANGE").val(Math.min(Number($("#DIST-OD").val()), Number($("#PROX-OD").val())) + (1*conversion)); 
    return false; 
  }
  if (Number($("#DIST-OD").val()) > Number($("#DIAMETER").val() -(1*conversion))) {
    $("#DIST-OD, #DIST-OD-RANGE").val(Number($("#DIAMETER").val() -(1*conversion)));
    return false;
  }
  if ((Number($("#DIST-ID").val())+Number($("#DWT").val())) > Number($("#DIAMETER").val() -(1*conversion))) {
    $("#DIST-ID, #DIST-ID-RANGE").val(Number($("#DIAMETER").val()) -(1*conversion)-Number($("#DWT").val()));
    return false;
  }
  if (Number($("#PROX-OD").val()) > Number($("#DIAMETER").val() -(1*conversion))) {
    $("#PROX-OD, #PROX-OD-RANGE").val(Number($("#DIAMETER").val() -(1*conversion)));
    return false;
  }
  if ((Number($("#PROX-ID").val())+Number($("#DWT").val())) > Number($("#DIAMETER").val() -(1*conversion))) {
    $("#PROX-ID, #PROX-ID-RANGE").val(Number($("#DIAMETER").val()) -(1*conversion)-Number($("#DWT").val()));
    return false;
  }
  if (Number($("#DIST-ID").val()) < (.4*conversion)) {
    $("#DIST-ID, #DIST-ID-RANGE").val((.4*conversion).toFixed(3));
    return false;
  }
  if (Number($("#PROX-ID").val())  < (.4*conversion)) {
    $("#PROX-ID, #PROX-ID-RANGE").val((.4*conversion).toFixed(3));
    return false;
  }
  if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D', ''].includes($("#MATERIAL").val())) {
    var compliant = false;
  } else {
    var compliant = true;
  }
  if($("#SUGGESTED-DIST-ID").is(":checked")) {
    if (compliant) {
     if((Number($("#DIST-OD").val())-((Number($("#DWT").val())*4)*2)) < (0.4*conversion)) {
       $("#DIST-OD,#DIST-OD-RANGE").val(((0.4*conversion)+((Number($("#DWT").val())*4)*2)).toFixed(3))
       return false;
     }
    } else {
      if((Number($("#DIST-OD").val())-((Number($("#DWT").val())*2)*2)) < (0.4*conversion)) {
         $("#DIST-OD,#DIST-OD-RANGE").val(((0.4*conversion)+((Number($("#DWT").val())*2)*2)).toFixed(3))
       return false;
     }
    }
  }
  if($("#SUGGESTED-PROX-ID").is(":checked")) {
    if (compliant) {
     if((Number($("#PROX-OD").val())-((Number($("#DWT").val())*4)*2)) < (0.4*conversion)) {
       $("#PROX-OD,#PROX-OD-RANGE").val(((0.4*conversion)+((Number($("#DWT").val())*4)*2)).toFixed(3))
       return false;
     }
    } else {
      if((Number($("#PROX-OD").val())-((Number($("#DWT").val())*2)*2)) < (0.4*conversion)) {
       $("#PROX-OD,#PROX-OD-RANGE").val(((0.4*conversion)+((Number($("#DWT").val())*2)*2)).toFixed(3))
       return false;
     }
    }
  }
  // if ((Number($("#DIST-ID").val()) + (Number($("#DWT").val())))  > Number($("#DIST-OD").val())) {
  //   $("#DIST-ID, #DIST-ID-RANGE").val(Number($("#DIST-OD").val())-Number($("#DWT").val()));
  //   return false;
  // }
  // if ((Number($("#PROX-ID").val()) + (Number($("#DWT").val())))  > Number($("#PROX-OD").val())) {
  //   $("#PROX-ID, #PROX-ID-RANGE").val(Number($("#PROX-OD").val())-Number($("#DWT").val()));
  //   return false;
  // }
  return true;
}
function updateParams(driver) {
  if (preventImpossible()) {
    if($("#mode").is(":checked")) {
      var color = '#e0e0e0'
    } else {
      var color = '#333'
    }
   params = {
      Diameter: Number($("#DIAMETER").val()),
      Length: Number($("#LEN").val()),
      distConeAng: Number($("#DIST-CONE").val()),
      distTailOd: Number($("#DIST-OD").val()),
      distTailID: Number($("#DIST-ID").val()),
      distTailLen: Number($("#DIST-NECK").val()),
      proxConeAng: Number($("#PROX-CONE").val()),
      proxTailOd: Number($("#PROX-OD").val()),
      proxTailID: Number($("#PROX-ID").val()),
      proxTailLen: Number($("#PROX-NECK").val()),
      proxCurve: $("#PROX-CURVE").is(':checked'),
      distCurve: $("#DIST-CURVE").is(':checked'),
      WT: Number($("#DWT").val()),
      radius: Number($("#RADIUS").val()),
      takeScreenshot: takeScreenshot,
      exportBinary: exportBinary,
      sphereColor: color
  }
  createShape(driver);
  
  calculate();
  }
}
$(".updater").on('input', function(e) {
  if($("#"+e.target.id).hasClass('dim') || $("#"+e.target.id).hasClass('cone-dim')) {
  if (e.target.id.includes('RANGE')) {
    var pair = e.target.id.replace('-RANGE','');
    $("#"+pair).val($("#"+e.target.id).val());
  }
  }
 updateParams(e.target.id);
});
const folder = gui.addFolder( 'Body' );
folder.add( params, 'Diameter', 0, 25, .25).onChange( createShape );   
//folder.add( params, 'bodyBottom', 0, 25, .01).onChange( createShape );
folder.add( params, 'Length', 0, 180, 1).onChange( createShape );
folder.add(params, 'WT', .01, .1).onChange(createShape)
            folder.hide();

const exportFolder = gui.addFolder( 'Export' );
const imageController = exportFolder.add( params, 'takeScreenshot').name('Save as Image');
const stlController = exportFolder.add( params, 'exportBinary').name('Save as STL');

const distalFolder = gui.addFolder( 'Distal End' );
distalFolder.add( params, 'distConeAng', 3, 90, 1).name('Distal Cone Angle').onChange( createShape );
distalFolder.add( params, 'distTailOd', 0, 4, .01).name('Distal Tail OD').onChange( createShape );
distalFolder.add( params, 'distTailLen', 2, 100, 1).name('Distal Tail Length').onChange( createShape );
distalFolder.add( params , 'distCurve').name('Rounded').onChange(createShape);
distalFolder.add(params, 'distTailID', 0, 4).onChange(createShape);
            distalFolder.hide();

const proximalFolder = gui.addFolder( 'Proximal End' );
proximalFolder.add( params, 'proxConeAng', 3, 90, 1).name('Proximal Cone Angle').onChange( createShape );
proximalFolder.add( params, 'proxTailOd', 0, 4, .01).name('Proximal Tail OD').onChange( createShape );
proximalFolder.add( params, 'proxTailLen', 2, 100, 1).name('Proximal Tail Length').onChange( createShape );
proximalFolder.add( params , 'proxCurve').name('Rounded').onChange(createShape);
proximalFolder.add(params, 'proxTailID', 0, 4).onChange(createShape);
const sphereController = proximalFolder.add(params, 'sphereColor', ['#333', '#e0e0e0']).onChange( createSphere );
            proximalFolder.hide();

function createSphere() {
const spheregeometry = new THREE.SphereGeometry( 200, 32, 16 );
const material = new THREE.MeshStandardMaterial({color: params.sphereColor, roughness: .8});
const sphere = new THREE.Mesh( spheregeometry, material ); 
sphere.material.side = THREE.BackSide;
sphere.receiveShadow = true;

const bg = new THREE.Object3D();

bg.name = "bg";
bg.add(sphere);
scene.add(bg);
console.log('i have been loaded');
}
createSphere();

function createShape(driver){
if ( $("#unit").val() == 'mm' ) {
    var conversion = 1;
  } else {
    var conversion = 0.03937;
  }

//tail business
if(driver == 'DIST-ID-RANGE' || driver == 'DIST-ID') {
  if(params.distTailID + params.WT > params.distTailOd) {
    $("#DIST-OD-RANGE").val(params.distTailID + params.WT).trigger("input");
  }
}
if(driver == 'DIST-OD-RANGE' || driver == 'DIST-OD') {
  if(params.distTailOd - params.WT < params.distTailID) {
    $("#DIST-ID-RANGE").val(params.distTailOd - params.WT).trigger("input");
  }
}
if(driver == 'PROX-ID-RANGE' || driver == 'PROX-ID') {
  if(params.proxTailID + params.WT > params.proxTailOd) {
    $("#PROX-OD-RANGE").val(params.proxTailID + params.WT).trigger("input");
  }
}
if(driver == 'PROX-OD-RANGE' || driver == 'PROX-OD') {
  if(params.proxTailOd - params.WT < params.proxTailID) {
    $("#PROX-ID-RANGE").val(params.proxTailOd - params.WT).trigger("input");
  }
}


  

  
//PARAMETER MATH
//Hoop Ratio (diameter id / tail id)
var hoop = (params.Diameter - (params.WT*2)) / Math.min(params.proxTailID, params.distTailID)

//END PARAMETER MATH
//camera.position.set(-3, 5, 20).setLength(Math.max((params.Length*1.4), 50));  
if (params.proxCurve) {

var proxAngle = (params.radius*conversion)+((params.Diameter/2)-(params.proxTailOd/2));

} else {
var proxAngle = (((params.Diameter-params.proxTailOd)/2)*Math.tan((90-params.proxConeAng) * Math.PI/180));
}
if (params.distCurve) {
var distAngle = (params.radius*conversion)+((params.Diameter/2)-(params.distTailOd/2)); 

} else {
var distAngle = (((params.Diameter-params.distTailOd)/2)*Math.tan((90-params.distConeAng) * Math.PI/180));
}

$("#distLengthNumber").text(distAngle.toFixed(2));
$("#proxLengthNumber").text(proxAngle.toFixed(2));
  
//Create path
var path = new THREE.Path()
//Move away from central Axis
path.moveTo(params.proxTailOd/2,0.0)
//Proximal Tail
path.lineTo(params.proxTailOd/2,params.proxTailLen)
//Proximal Cone
if(!params.proxCurve) {
path.lineTo((params.Diameter/2),params.proxTailLen+proxAngle)
} else {
path.arc(params.radius*conversion, 0, params.radius*conversion, Math.PI, Math.PI/2,true);
path.arc(0, (params.Diameter/2)-(params.proxTailOd/2)-(params.radius*conversion), (params.Diameter/2)-(params.proxTailOd/2)-(params.radius*conversion), -Math.PI/2, 0, false);
}
//Body
path.lineTo((params.Diameter/2),params.proxTailLen+proxAngle+params.Length)
//Distal Cone
if(!params.distCurve) {
  path.lineTo((params.distTailOd/2), params.proxTailLen+proxAngle+params.Length+distAngle)
} else {
path.arc(-((params.Diameter/2)-(params.distTailOd/2)-(params.radius*conversion)), 0, (params.Diameter/2)-(params.distTailOd/2)-(params.radius*conversion), 0, Math.PI/2, false);
path.arc(0, params.radius*conversion, -params.radius*conversion, Math.PI/2, 0,true);
}
//Distal Tail
path.lineTo(params.distTailOd/2,params.proxTailLen+proxAngle+params.Length+distAngle+params.distTailLen)
// Non/semi .0015 double to .006 
// compliant .0008 up to .010

// the lathe object, initially it is just a box
// but will be soon replaced by a lathe

var lathe = new THREE.Mesh(
		new THREE.BoxGeometry( 10, 10, 10 ),
		new THREE.MeshStandardMaterial( {
						color: '#ffffff',
						roughness: 0.59,
						metalness: 0.5, 
            // transparent:true,
            // opacity:.6,
						side: THREE.DoubleSide
				} )
);
scene.add( lathe );


// temporary variables, v=vector, t=tangent

var v = new THREE.Vector2(),
		t = new THREE.Vector2();
  
var WT = params.WT;

// generates a new lathe geometry with desired thickness

function changeThickness( WT ) {
  if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D', ''].includes($("#MATERIAL").val())) {
    var compliant = false;
  } else {
    var compliant = true;
  }
   if($("#SUGGESTED-DIST-ID").is(":checked")) {

         if(compliant) {
           $("#DIST-ID-RANGE, #DIST-ID").val((Number($("#DIST-OD").val())-((params.WT*4)*2)).toFixed(3));
           var distTailWT = params.WT*4;
         } else {
          $("#DIST-ID-RANGE, #DIST-ID").val((Number($("#DIST-OD").val())-((params.WT*2)*2)).toFixed(3));
           var distTailWT = params.WT*2;
         }
   
      } else {
        var distTailWT = (params.distTailOd-params.distTailID)/2;
      }

     if($("#SUGGESTED-PROX-ID").is(":checked")) {

         if(compliant) {
           $("#PROX-ID-RANGE, #PROX-ID").val((Number($("#PROX-OD").val())-((params.WT*4)*2)).toFixed(3));
           var proxTailWT = params.WT*4;
         } else {
          $("#PROX-ID-RANGE, #PROX-ID").val((Number($("#PROX-OD").val())-((params.WT*2)*2)).toFixed(3));
           var proxTailWT = params.WT*2;
         }
     
      } else {
        var proxTailWT = (params.proxTailOd-params.proxTailID)/2;
      }
    

		var n = 500;
		var points = [];
    let decreaseFactor = 0;
    let increaseFactor = 0;
    let proximalTaperDistance = 0;
    let distalTaperDistance = 0;
    for ( var i=0; i<n; i++ )
		{
      if (path.getPoint(i/n, v)["y"] >= params.proxTailLen && path.getPoint(i/n, v)["y"] <= params.proxTailLen + proxAngle) { proximalTaperDistance += 1}
      
      if (path.getPoint(i/n, v)["y"] >= params.proxTailLen+proxAngle+params.Length && path.getPoint(i/n, v)["y"] <= params.proxTailLen+proxAngle+params.Length+distAngle) { distalTaperDistance += 1}
    }
  
		// scan the path and offset vertices along the normal vector
		for ( var i=0; i<n; i++ )
		{
				path.getPoint( i/n, v); 		// get a vertex
        
				path.getTangent( i/n, t);		// get a tangent
				t.set( t.y,-t.x );					// rotate into a normal
        //console.log(path.getPoint(i/n, v)['x'])
        var proxTailLimit = params.proxTailLen + (params.radius*conversion) + proxAngle;
        var offset = 0;
        var position = path.getPoint(i/n, v)["y"];
        if(params.proxCurve || params.distCurve) { var offSet = params.radius*conversion}
        if(params.distCurve && params.proxCurve) { var offSet = (params.radius*conversion)*1.5}
        var distTailLimit = params.proxTailLen  + proxAngle + params.Length;
        //Handle Proximal Radius Taper
        if(position >= params.proxTailLen && position <= proxTailLimit){
          
				points.push( v.addScaledVector(t,-proxTailWT-decreaseFactor).clone() );
        decreaseFactor += -((proxTailWT - params.WT)/(proximalTaperDistance+1))
          
          
		    } 
        
        //Handle Distal Radius Taper
				else if(position >= distTailLimit && position <= distTailLimit+ distAngle){
          
				points.push( v.addScaledVector(t,-params.WT-(increaseFactor)).clone() );
        increaseFactor += ((distTailWT - params.WT)/(distalTaperDistance+1))
          
				} 
      
        //Handle Thickness of Proximal Tail
        else if(position <= proxTailLimit){
        //Should WT be different at each tail? If So, this needs to be broken into two statements.
        points.push( v.addScaledVector(t,-proxTailWT).clone() )
        } 
        
        //Handle Thickness of Distal Tail
        else if(position >= distTailLimit){
        //Should WT be different at each tail? If So, this needs to be broken into two statements.
        points.push( v.addScaledVector(t,-distTailWT).clone() )
        } 
        //Handle Body Thickness
        else{
        points.push( v.addScaledVector(t,-WT).clone() );
        }
    
    
    }
		// keep the outer side the same, just reverse the order
		for ( var i=n-1; i>=0; i-- )
		{
				path.getPoint( i/n, v);
				points.push( v.clone() );
		}

		// close the shape
		points.push( points[0] );

		// replace the geometry
    if(driver == 'DWT-RANGE' || driver == 'DWT') {
      var spin = Math.PI;
    } else {
      var spin = Math.PI*2;
    }
		lathe.geometry.dispose();
		lathe.geometry = new THREE.LatheGeometry( points, 40, Math.PI/2, spin );
  lathe.geometry.center()

}


// initial thickness

changeThickness( WT );
var previous = scene.getObjectByName( "obj" );
if (previous != "") {
  
scene.remove(previous);

            }


const obj = new THREE.Object3D();

obj.name = "obj";
obj.add(lathe)
  //ROTATION
//obj.rotation.x = 6;
scene.add(obj);

}

createShape();


function animationLoop( t )
{
    controls.update( );
		light.position.copy( camera.position );
    renderer.render( scene, camera );
    
}

$(".cost").prop("readonly",true);

var day = dayjs().day();
if (day == 6) {
$("#6-week-date").text(dayjs().add(44, 'day').format('MMMM DD')+" - "+dayjs().add(58, 'day').format('MMMM DD'));
$("#4-week-date").text(dayjs().add(30, 'day').format('MMMM DD')+" - "+dayjs().add(44, 'day').format('MMMM DD'));

}
else if (day == 7) {
$("#6-week-date").text(dayjs().add(43, 'day').format('MMMM DD')+" - "+dayjs().add(57, 'day').format('MMMM DD'));
$("#4-week-date").text(dayjs().add(29, 'day').format('MMMM DD')+" - "+dayjs().add(43, 'day').format('MMMM DD'));
} else {
$("#6-week-date").text(dayjs().add(42, 'day').format('MMMM DD')+" - "+dayjs().add(56, 'day').format('MMMM DD'));
$("#4-week-date").text(dayjs().add(28, 'day').format('MMMM DD')+" - "+dayjs().add(42, 'day').format('MMMM DD'));
}


//SPHERICAL CHECKBOX
$("#SPHERICAL").on('change', function() {
  if($(this).is(':checked')){

  $("#LEN-RANGE,#LEN").val(0);
  $("#DIST-CURVE,#PROX-CURVE").prop('checked', true);
  } 
  else {

  $("#LEN-RANGE,#LEN").val(10);
  $("#DIST-CURVE,#PROX-CURVE").prop('checked', false);
  }
  updateParams()
});
//END SPHERICAL CHECKBOK






$(document).on("click", "#apply-expedite", function(){
if($(this).is(":checked")) {
$("#4-week-price").val($("#6-week-price").val());
$("#4-week").prop('checked', true).trigger('change');
} else {
$("#6-week-price").trigger('change');
}
});


//SET INITIAL PRICES
$("#6-week-price").on('change', function(){
if(user.model?.discount) {
  var discount = 1 - Number(user.model.discount);
} else {
  var discount = 1;
}
var startPrice = this.value;
$("#6-week-price").val((Number(startPrice)*discount).toFixed(2));
$("#6-week-discount").text('$' + (Number(startPrice).toFixed(2)));
$("#4-week-price").val(((Number(startPrice)+500)*discount).toFixed(2));
$("#4-week-discount").text('$' + (Number(startPrice)+500).toFixed(2));
});
//END SET INITIAL PRICES


$(document).ready(function() {

let intervalId;

function attemptAction() {
  // Attempt the action
  const success = doSomething();

  if (success) {
    $("#6-week-price").trigger("change");
    // If successful, clear the interval
    clearInterval(intervalId);
    console.log("Action succeeded!");
  } else {
    console.log("Action failed, retrying...");
  }
}

// Placeholder for the action to be performed
function doSomething() {
  // Replace this with the actual action that needs to be performed
  // Return true for success, false for failure
  // For example:
  var checkUser = localStorage.getItem('pocketbase_auth');
  if(checkUser === null) {
    return false;
  } else {
    user = JSON.parse(localStorage.getItem('pocketbase_auth'));
    if(user.model?.reward) {
     var reward = user.model.reward; 
    } else {
      var reward = 0;
    }
    
    if((sessionStorage.getItem("rewards") !== null) && (Number((sessionStorage.getItem("rewards"))) > 0)) {
    var storedReward = Number(sessionStorage.getItem("rewards"));
    var checkReward = Math.min(reward, storedReward);
    } else {
    var checkReward = reward;
    }
    $("#reward-counter").val(checkReward);
    if(reward > 0) {
    $("#reward-box").removeClass("hide-price");
    $("#reward-counter").val(checkReward);
    $("#expedites-remaining").text(checkReward);
    }
    
    
    return true;
  }

}

// Set the interval to run the action every 100 milliseconds
intervalId = setInterval(attemptAction, 100);
  
 var browser = $.browser.name +
               " v" + $.browser.versionNumber + 
               " on " + $.browser.platform;
 var message = {
    "system": browser
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
$('#qty-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#qty-popup",
    collision: "none"
  }
  });
$('#shipping-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-method",
    collision: "none"
  }
  });
$('#account-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-account",
    collision: "none"
  }
  });

  $('#too-many-lines').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#2-day-date",
    collision: "none"
  }
  });
$('#verification').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-verification",
    collision: "none"
  }
  });
  $('#empty-po').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-number",
    collision: "none"
  }
  });
$('#cert-0').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-0-dialog",
    collision: "none"
  }
  });
$('#cert-1').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-1-dialog",
    collision: "none"
  }
  });
$('#cert-2').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-2-dialog",
    collision: "none"
  }
  });
$('#cert-3').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-3-dialog",
    collision: "none"
  }
  });
$('#length-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#LEN",
    collision: "none"
  }
  });
$('#diameter-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIAMETER",
    collision: "none"
  }
  });
$('#dwt-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DWT",
    collision: "none"
  }
  });
$('#dist-od-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIST-OD",
    collision: "none"
  }
  });
$('#dist-id-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIST-ID",
    collision: "none"
  }
  });
$('#dist-neck-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIST-NECK",
    collision: "none"
  }
  });
$('#dist-cone-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIST-CONE",
    collision: "none"
  }
  });
$('#prox-od-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#PROX-OD",
    collision: "none"
  }
  });
$('#prox-id-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#PROX-ID",
    collision: "none"
  }
  });
$('#prox-neck-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#PROX-NECK",
    collision: "none"
  }
  });
$('#prox-cone-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#PROX-CONE",
    collision: "none"
  }
  });
$('#burst-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#REQUESTED-BURST",
    collision: "none"
  }
  });

$('#volume-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#REQUESTED-VOLUME",
    collision: "none"
  }
  });
$('#min-volume-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#REQUESTED-MIN-VOLUME",
    collision: "none"
  }
  });
$('#dist-hoop-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#DIST-ID",
    collision: "none"
  }
  });
$('#prox-hoop-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#PROX-ID",
    collision: "none"
  }
  });
$('#requested-burst-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#REQUESTED-BURST",
    collision: "none"
  }
  });

$('#requested-fatigue-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#REQUESTED-FATIGUE",
    collision: "none"
  }
  });
$('#prox-wt-details-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#prox-wt-notice",
    collision: "none"
  }
  });
$('#dist-wt-details-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#dist-wt-notice",
    collision: "none"
  }
  });
});

//VALIDATION
// var greenlight = $("#greenlight");
//   //if greenlight
//     greenlight.prop('checked', true);
//     greenlight.trigger('change'); 
  //handle error fields with adding and removing 'error' class (also use hasClass())

//START BALLOON VALIDATION

    function checkDistNeck(compliant, conversion){
      var DIST_NECK = Number($("#DIST-NECK").val());
      if(compliant) {
        if(DIST_NECK >= (2*conversion) && DIST_NECK <= (25*conversion)) {
          removeError('dist-neck-small');
          removeError('dist-neck-large');
          return true; 
        } else { 
          if(DIST_NECK < (2*conversion)) {
          addError(
            'dist-neck-small',
            'Your distal neck length is too small to qualify for an instant quote.',
            'Increase distal neck length',
            null,
            '#DIST-NECK'
        );
          }
          if(DIST_NECK > (25*conversion)) {
          addError(
            'dist-neck-large',
            'Your distal neck length is too large to qualify for an instant quote.',
            'Decrease distal neck length',
            null,
            '#DIST-NECK'
        );
          }
          return false; 
        }
      } else {
        if(DIST_NECK >= (2*conversion) && DIST_NECK <= (25*conversion)) { 
          removeError('dist-neck-small')
          removeError('dist-neck-large');
          return true; 
        } else { 
          if(DIST_NECK < (2*conversion)) {
          addError(
            'dist-neck-small',
            'Your distal neck length is too small to qualify for an instant quote.',
            'Increase distal neck length',
            null,
            '#DIST-NECK'
        );
          }
          if(DIST_NECK > (25*conversion)) {
          addError(
            'dist-neck-large',
            'Your distal neck length is too large to qualify for an instant quote.',
            'Decrease distal neck length',
            null,
            '#DIST-NECK'
        );
          }
          return false; 
        }
      }
    }
    function checkProxNeck(compliant, conversion){
      var PROX_NECK = Number($("#PROX-NECK").val());
      if(compliant) {
        if(PROX_NECK >= (2*conversion) && PROX_NECK <= (25*conversion)) { $("#PROX-NECK").removeClass('error'); $("#prox-neck-dialog").dialog("close"); return true; } else { $("#PROX-NECK").addClass('error'); $("#prox-neck-dialog").dialog("open"); return false; }
      } else {
        if(PROX_NECK >= (2*conversion) && PROX_NECK <= (25*conversion)) { $("#PROX-NECK").removeClass('error'); $("#prox-neck-dialog").dialog("close"); return true;} else { $("#PROX-NECK").addClass('error'); $("#prox-neck-dialog").dialog("open");return false; }
      }  
    }
    function checkDistNeckTol(compliant, conversion){
      var DIST_NECK_TOL = $("#DIST-NECK-TOL").val().toLowerCase();
      if(compliant) {
        if(DIST_NECK_TOL == 'min') { $("#DIST-NECK-TOL").removeClass('error'); return true; } else { $("#DIST-NECK-TOL").addClass('error'); return false; }
      } else {
        if(DIST_NECK_TOL == 'min') { $("#DIST-NECK-TOL").removeClass('error'); return true; } else { $("#DIST-NECK-TOL").addClass('error'); return false; }
      }  
    }
    function checkProxNeckTol(compliant, conversion){
      var PROX_NECK_TOL = $("#PROX-NECK-TOL").val().toLowerCase();
      if(compliant) {
        if(PROX_NECK_TOL == 'min') { $("#PROX-NECK-TOL").removeClass('error'); return true; } else { $("#PROX-NECK-TOL").addClass('error'); return false; }
      } else {
        if(PROX_NECK_TOL == 'min') { $("#PROX-NECK-TOL").removeClass('error'); return true; } else { $("#PROX-NECK-TOL").addClass('error'); return false; }
      }    
    }
    function checkLength(compliant, conversion){
      
      var LEN = Number($("#LEN").val()) + Number($("#DIST-NECK").val()) + Number($("#PROX-NECK").val()) + parseFloat($("#distLengthNumber").text()) + parseFloat($("#proxLengthNumber").text())

      
      var DIAMETER = Number($("#DIAMETER").val());
      if (DIAMETER >= (1*conversion) && DIAMETER <= (8*conversion)) {
        if(LEN >= 0 && LEN <= (170*conversion)) { $("#LEN").removeClass('error'); $("#length-dialog").dialog("close");return true; } else { $("#LEN").addClass('error'); $("#length-dialog").dialog("open"); return false; }
      } else if (DIAMETER > (8*conversion) && DIAMETER <= (12.5*conversion)) {
        if(LEN >= 0 && LEN <= (64*conversion)) { $("#LEN").removeClass('error'); $("#length-dialog").dialog("close"); return true; } else { $("#LEN").addClass('error'); $("#length-dialog").dialog("open"); return false; }
      } else if (DIAMETER > (12.5*conversion) && DIAMETER <= (19*conversion)) {
        if(LEN >= 0 && LEN <= (60*conversion)) { $("#LEN").removeClass('error'); $("#length-dialog").dialog("close"); return true; } else { $("#LEN").addClass('error'); $("#length-dialog").dialog("open"); return false; }
      } else if (DIAMETER > (19*conversion) && DIAMETER <= (23.5*conversion)) {
        if(LEN >= 0 && LEN <= (170*conversion)) { $("#LEN").removeClass('error'); $("#length-dialog").dialog("close"); return true; } else { $("#LEN").addClass('error'); $("#length-dialog").dialog("open"); return false; }
      } else if (DIAMETER > (27.5*conversion) && DIAMETER <= (33*conversion)) {
        if(LEN >= 0 && LEN <= (170*conversion)) { $("#LEN").removeClass('error'); $("#length-dialog").dialog("close"); return true; } else { $("#LEN").addClass('error'); $("#length-dialog").dialog("open"); return false; }
      }
      
    }
    function checkLengthTol(compliant, conversion){
      var LEN_TOL = Number($("#LEN-TOL").val());
      if(compliant) {
        if(LEN_TOL >= (0.5*conversion)) { $("#LEN-TOL").removeClass('error'); return true; } else { $("#LEN-TOL").addClass('error'); return false; }
      } else {
        if(LEN_TOL >= (0.5*conversion)) { $("#LEN-TOL").removeClass('error'); return true; } else { $("#LEN-TOL").addClass('error'); return false; }
      }    
    }
    function checkDiameter(compliant, conversion){
      var DIAMETER = Number($("#DIAMETER").val());
      if(compliant) {
        if(DIAMETER >= (1*conversion) && DIAMETER <= (33*conversion)) { $("#DIAMETER").removeClass('error'); $("#diameter-dialog").dialog("close"); return true; } else { $("#DIAMETER").addClass('error'); $("#diameter-dialog").dialog("open"); return false; }
      } else {
        if(DIAMETER >= (1*conversion) && DIAMETER <= (33*conversion)) { $("#DIAMETER").removeClass('error'); $("#diameter-dialog").dialog("close"); return true; } else { $("#DIAMETER").addClass('error'); $("#diameter-dialog").dialog("open"); return false; }
      }  
    }
    function checkDiameterTol(compliant, conversion){
      var DIAMETER_TOL = $("#DIAMETER-TOL").val();
      if(compliant) {
        if(DIAMETER_TOL.toLowerCase() == 'min') { $("#DIAMETER-TOL").removeClass('error'); return true; } else { $("#DIAMETER-TOL").addClass('error'); return false; }
      } else {
        if(Number(DIAMETER_TOL) >= (0.5*conversion)) { $("#DIAMETER-TOL").removeClass('error'); return true; } else { $("#DIAMETER-TOL").addClass('error'); return false; }
      }  
    }
    function checkDWT(compliant, conversion){
      var DWT = Number($("#DWT").val());
      if(compliant) {
        if(DWT >= (0.05*conversion) && DWT <= (0.38*conversion)) { $("#DWT").removeClass('error'); $("#dwt-dialog").dialog("close"); return true; } else { $("#DWT").addClass('error'); $("#dwt-dialog").dialog("open"); return false; }
      } else {
        if(DWT >= (0.05*conversion) && DWT <= (0.25*conversion)) { $("#DWT").removeClass('error'); $("#dwt-dialog").dialog("close"); return true; } else { $("#DWT").addClass('error'); $("#dwt-dialog").dialog("open"); return false; }
      }  
    }
    function checkDWTTol(compliant, conversion){
      var DWT_TOL = Number($("#DWT-TOL").val());
      if(compliant) {
        if(DWT_TOL >= (0.0125*conversion)) { $("#DWT-TOL").removeClass('error'); return true; } else { $("#DWT-TOL").addClass('error'); return false; }
      } else {
        if(DWT_TOL >= (0.0125*conversion)) { $("#DWT-TOL").removeClass('error'); return true; } else { $("#DWT-TOL").addClass('error'); return false; }
      }  
    }
    function checkDistOd(compliant, conversion){
      var DIST_OD = Number($("#DIST_OD").val());
      // if(compliant) {
      //   if(DIST_OD >= 0.0015 && DIST_OD <= 0.003) { $("#DIST-OD").removeClass('error'); $("#dist-od-dialog").dialog("close"); return true; } else { $("#DIST-OD").addClass('error'); $("#dist-od-dialog").dialog("open"); return false; }
      // } else {
      //   if(DIST_OD >= 0.008 && DIST_OD <= 0.01) { $("#DIST-OD").removeClass('error'); $("#dist-od-dialog").dialog("close"); return true; } else { $("#DIST-OD").addClass('error'); $("#dist-od-dialog").dialog("open"); return false; }
      // }  
      return true;
    }
    function checkDistOdTol(compliant, conversion){
      var DIST_OD_TOL = Number($("#DIST-OD-TOL").val());
      if(compliant) {
        if(DIST_OD_TOL >= (0.075*conversion)) { $("#DIST-OD-TOL").removeClass('error'); return true; } else { $("#DIST-OD-TOL").addClass('error'); return false; }
      } else {
        if(DIST_OD_TOL >= (0.075*conversion)) { $("#DIST-OD-TOL").removeClass('error'); return true; } else { $("#DIST-OD-TOL").addClass('error'); return false; }
      }  
    }
    function checkProxOd(compliant, conversion){
      return true;
    }
    function checkProxOdTol(compliant, conversion){
      var PROX_OD_TOL = Number($("#PROX-OD-TOL").val());
      if(compliant) {
        if(PROX_OD_TOL >= (0.075*conversion)) { $("#PROX-OD-TOL").removeClass('error'); return true; } else { $("#PROX-OD-TOL").addClass('error'); return false; }
      } else {
        if(PROX_OD_TOL >= (0.075*conversion)) { $("#PROX-OD-TOL").removeClass('error'); return true; } else { $("#PROX-OD-TOL").addClass('error'); return false; }
      }  
    }
    function checkDistID(compliant, conversion){
      var DIST_WT = (Number($("#DIST-OD").val()) - Number($("#DIST-ID").val())) / 2;
      var DWT = Number($("#DWT").val());
      
      if(compliant) {
        if(DIST_WT <= (DWT*10) ) { $("#DIST-ID").removeClass('error'); return true; } else { $("#DIST-ID").addClass('error'); return false; }
      } else {
        if(DIST_WT <= (DWT*10) ) { $("#DIST-ID").removeClass('error'); return true; } else { $("#DIST-ID").addClass('error'); return false; }
      }  
      
    }
    function checkDistIDTol(compliant, conversion){
      var DIST_ID_TOL = Number($("#DIST-ID-TOL").val());
      if(compliant) {
        if(DIST_ID_TOL >= (0.025*conversion)) { $("#DIST-ID-TOL").removeClass('error'); return true; } else { $("#DIST-ID-TOL").addClass('error'); return false; }
      } else {
        if(DIST_ID_TOL >= (0.025*conversion)) { $("#DIST-ID-TOL").removeClass('error'); return true; } else { $("#DIST-ID-TOL").addClass('error'); return false; }
      }  
    }
    function checkProxID(compliant, conversion){
      var PROX_WT = (Number($("#PROX-OD").val()) - Number($("#PROX-ID").val())) / 2;
      var DWT = Number($("#DWT").val());
     
      if(compliant) {
        if(PROX_WT <= (DWT*10)) { $("#PROX-ID").removeClass('error'); return true; } else { $("#PROX-ID").addClass('error'); return false; }
      } else {
        if(PROX_WT <= (DWT*10)) { $("#PROX-ID").removeClass('error'); return true; } else { $("#PROX-ID").addClass('error'); return false; }
      }  
    
    }
    function checkProxIDTol(compliant, conversion){
      var PROX_ID_TOL = Number($("#PROX-ID-TOL").val());
      if(compliant) {
        if(PROX_ID_TOL >= (0.025*conversion)) { $("#PROX-ID-TOL").removeClass('error'); return true; } else { $("#PROX-ID-TOL").addClass('error'); return false; }
      } else {
        if(PROX_ID_TOL >= (0.025*conversion)) { $("#PROX-ID-TOL").removeClass('error'); return true; } else { $("#PROX-ID-TOL").addClass('error'); return false; }
      } 
    }
    function checkDistCone(compliant, conversion){
	
	if (!$("#DIST-CURVE").is(":checked")) {
		var DIST_CONE = Number($("#DIST-CONE").val());
		if(DIST_CONE >= 20 && DIST_CONE <= 90 ) { $("#DIST-CONE").removeClass('error'); $("#dist-cone-dialog").dialog("close"); return true; } else { $("#DIST-CONE").addClass('error'); $("#dist-cone-dialog").dialog("open"); return false; }
	} else {
		return true;
	}
      
    }
    function checkDistConeTol(compliant, conversion){
      if (!$("#DIST-CURVE").is(":checked")) {
		var DIST_CONE_TOL = Number($("#DIST-CONE-TOL").val());
		if(DIST_CONE_TOL >= 3) { $("#DIST-CONE-TOL").removeClass('error'); return true; } else { $("#DIST-CONE-TOL").addClass('error'); return false; }
	} else {
		return true;
	}
    }

    function checkProxCone(compliant, conversion){
      if (!$("#PROX-CURVE").is(":checked")) {
		var PROX_CONE = Number($("#PROX-CONE").val());
		if(PROX_CONE >= 20 && PROX_CONE <= 90 ) { $("#PROX-CONE").removeClass('error'); $("#prox-cone-dialog").dialog("close"); return true; } else { $("#PROX-CONE").addClass('error'); $("#prox-cone-dialog").dialog("open"); return false; }
	} else {
		return true;
	}
    }
    function checkProxConeTol(compliant, conversion){
      if (!$("#PROX-CURVE").is(":checked")) {
		var PROX_CONE_TOL = Number($("#PROX-CONE-TOL").val());
		if(PROX_CONE_TOL >= 3) { $("#PROX-CONE-TOL").removeClass('error'); return true; } else { $("#PROX-CONE-TOL").addClass('error'); return false; }
	} else {
		return true;
	}
    }

$("#LEN, #LEN-RANGE").on('input', function() {
       if($("#SPHERICAL").is(':checked') && Number(this.value) > 0) {
        $("#SPHERICAL").prop('checked', false);
      }
})




function checkHoop(compliant) {
  var distID = Number($("#DIST-ID").val())
  var proxID = Number($("#PROX-ID").val())
  var extrusionID = Math.min(distID, proxID);
  var DIAMETER = Number($("#DIAMETER").val()); 
  var hoopRatio = DIAMETER / extrusionID
  if($("#MATERIAL").val() == 'Vestamid ML21') {
    var maxHoop = 6;
  } else {
    var maxHoop = 8;
  }
  
  if (hoopRatio > maxHoop) {
    if (distID < proxID) {
    $("#DIST-ID").addClass('error')
    $("#dist-hoop-dialog").dialog("open");
    } else {
    $("#PROX-ID").addClass('error');
    $("#prox-hoop-dialog").dialog("open");
    }
    return false;
  } else {
    $("#DIST-ID, #PROX-ID").removeClass('error');
    $("#dist-hoop-dialog").dialog("close");
    $("#prox-hoop-dialog").dialog("close");
    return true;
  }
  
}

function checkBurst(compliant) {
// var material = $("#MATERIAL").val();
// var od = $("#DIAMETER").val();
// var length = $("#LEN").val();
// var DWT = $("#DWT").val();
// if (material == 'Vestamid ML21') {
//   var maxBurst = 29.7208039 + (-20.4922410 * Number(od)) + (177.9935899 * Number(DWT)) + (-0.5149756 * Number(length));
// }
// else if (material == 'Pebax 72D') {
//   var maxBurst = 22.734500 + (-17.465646 * Number(od)) + (845.397879 * Number(DWT)) + (-1.103062 * Number(length));
// }
// else if (material == 'PET') {
//   var maxBurst = 21.8130994 + (-28.4427660 * Number(od)) + (1168.4017109 * Number(DWT)) + (0.9333406 * Number(length));
// }
// else if (material == 'Pellethane 80AE') {
//   var maxBurst = -50.87246 + (86.67743 * Number(od)) + (14289.03615 * Number(DWT)) + (27.47174 * Number(length));
// }
// else if (material == 'Pellethane 90AE') {
//   var maxBurst =  -29.351340 + (-7.307413 * Number(od)) + (486.353672 * Number(DWT)) + (71.314918 * Number(length));
// }

//  console.log(maxBurst)
//   if(compliant) {
//     if(Number($("#REQUESTED-MIN-VOLUME").val()) > Number(maxBurst)) {
//     $("#REQUESTED-MIN-VOLUME").addClass('error');
//     $("#requested-burst-dialog").dialog("open");
//     return false;
//   } else {
//     $("#REQUESTED-MIN-VOLUME").removeClass('error');
//     $("#requested-burst-dialog").dialog("close");
//     return true;
//   }
//   } else {
//   if(Number($("#REQUESTED-BURST").val()) > Number(maxBurst)) {
//     $("#REQUESTED-BURST").addClass('error');
//     $("#requested-burst-dialog").dialog("open");
//     return false;
//   } else {
//     $("#REQUESTED-BURST").removeClass('error');
//     $("#requested-burst-dialog").dialog("close");
//     return true;
//   }
//   }
return true;
}
function checkFatigue(compliant) {
  if(compliant) {
    return true;
  } else {
    if(Number($("#REQUESTED-FATIGUE").val()) > 10) {
      $("#REQUESTED-FATIGUE").addClass('error');
      $("#requested-fatigue-dialog").dialog("open");
      return false;
    } else {
      $("#REQUESTED-FATIGUE").removeClass('error');
      $("#requested-fatigue-dialog").dialog("close");
      return true;
    }
  }
  
}

function checkMaterial(compliant) {
  if($("#MATERIAL").val() == '') {
    return false;
  } else {
    return true;
  }
}

function checkQuantity(compliant) {
  var quantity = $("#QUANTITY").val();
  if(quantity == 'More') {
    return false;
  } else {
    if(compliant) {
      if (Number(quantity) == 25) {
        $("#6-week-price").val(13500);
      } else if (Number(quantity) == 50) {
        $("#6-week-price").val(13500 + 1000);
      } else if (Number(quantity) == 100) {
        $("#6-week-price").val(13500+3000);
      }

      //8 hours / 30 balloons = .26 hours per balloon. 25 balloons * .26 = 6.66 hours, 75 balloons * .26 = 20 hours
    } else {
      if (Number(quantity) == 25) {
        $("#6-week-price").val(9200);
      } else if (Number(quantity) == 50) {
        $("#6-week-price").val(9200 + 750);
      } else if (Number(quantity) == 100) {
        $("#6-week-price").val(9200+1800);
      }
    }
    $("#6-week-price").trigger('change');
    return true;
  }
}

function calculate() {
  if($("#unit").val() == 'mm') {
    var conversion = 1;
  } else {
    var conversion = 0.03937;
  }
  if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D', ''].includes($("#MATERIAL").val())) {
    var compliant = false;
  } else {
    var compliant = true;
  }
      var f1 = checkDistNeck(compliant, conversion)
      var f2 = checkProxNeck(compliant, conversion)
      var f3 = checkDistNeckTol(compliant, conversion)
      var f4 = checkProxNeckTol(compliant, conversion)
      var f5 = checkLength(compliant, conversion)
      var f6 = checkLengthTol(compliant, conversion)
      var f7 = checkDiameter(compliant, conversion)
      var f8 = checkDiameterTol(compliant, conversion)
      var f9 = checkDWT(compliant, conversion)
      var f10 = checkDWTTol(compliant, conversion)
      var f11 = checkDistOd(compliant, conversion)
      var f12 = checkDistOdTol(compliant, conversion)
      var f13 = checkProxOd(compliant, conversion)
      var f14 = checkProxOdTol(compliant, conversion)
      var f15 = checkDistID(compliant, conversion)
      var f16 = checkDistIDTol(compliant, conversion)
      var f17 = checkProxID(compliant, conversion)
      var f18 = checkProxIDTol(compliant, conversion)
      var f19 = checkDistCone(compliant, conversion)
      var f20 = checkDistConeTol(compliant, conversion)
      var f21 = checkProxCone(compliant, conversion)
      var f22 = checkProxConeTol(compliant, conversion)
      var f23 = checkHoop(compliant, conversion)
      var f24 = checkBurst(compliant, conversion)
      var f25 = checkFatigue(compliant, conversion)
      var f26 = checkMaterial(compliant, conversion)
      var f27 = checkQuantity(compliant, conversion)

//DEFINE VARIABLES
var MATERIAL = $("#MATERIAL").val();  
var DIAMETER = Number($("#DIAMETER").val());
var DIAMETER_TOL = Number($("#DIAMETER-TOL").val());
var LEN = Number($("#LEN").val());
var LEN_TOL = Number($("#LEN-TOL").val());

if($("#DIST-CURVE").is(':checked')) {
  var DIST_CONE = 'Rounded'; 
  var DIST_CONE_TOL = '';
  $("#dist-cone-settings").css('opacity', .5)
  $("#dist-cone-settings").css('pointer-events', 'none')
} else {
  var DIST_CONE = Number($("#DIST-CONE").val());
  var DIST_CONE_TOL = Number($("#DIST-CONE-TOL").val())
  $("#dist-cone-settings").css('opacity', 1)
  $("#dist-cone-settings").css('pointer-events', 'auto')
}

var DIST_OD = Number($("#DIST-OD").val());
var DIST_OD_TOL = Number($("#DIST-OD-TOL").val());
var DIST_ID = Number($("#DIST-ID").val());
var DIST_ID_TOL = Number($("#DIST-ID-TOL").val());

var DIST_NECK_TOL = Number($("#DIST-NECK-TOL").val());

if($("#PROX-CURVE").is(':checked')) {
  var PROX_CONE = 'Rounded'; 
  var PROX_CONE_TOL = '';
  $("#prox-cone-settings").css('opacity', .5)
  $("#prox-cone-settings").css('pointer-events', 'none')
} else {
  var PROX_CONE = Number($("#PROX-CONE").val());
  var PROX_CONE_TOL = Number($("#PROX-CONE-TOL").val())
  $("#prox-cone-settings").css('opacity', 1)
  $("#prox-cone-settings").css('pointer-events', 'auto')
  
}

var PROX_OD = Number($("#PROX-OD").val());
var PROX_OD_TOL = Number($("#PROX-OD-TOL").val());
var PROX_ID = Number($("#PROX-ID").val());
var PROX_ID_TOL = Number($("#PROX-ID-TOL").val());
var PROX_NECK = Number($("#PROX-NECK").val());
var PROX_NECK_TOL = Number($("#PROX-NECK-TOL").val());
var PROX_CURVE = $("#PROX-CURVE").is(':checked');
var DIST_CURVE = $("#DIST-CURVE").is(':checked');
var DWT = Number($("#DWT").val());
var DWT_TOL = Number($("#DWT-TOL").val());
var RADIUS = Number($("#RADIUS").val());

if($("#QUANTITY").val() == 'More') {
  var quantity = $("#custom-quantity").val();
} else {
  var quantity = $("#QUANTITY").val();
}
  //Non-Semi Compliant
  if(!compliant) {
  //Set Burst Menu
  $(".non-compliant-burst").css('display', 'flex');
  $(".compliant-burst").css('display', 'none'); 
    //CHECK FOR GREENLIGHT
    if(f1 && f2 && f3 && f4 && f5 && f6 && f7 && f8 && f9 && f10 && f11 && f12 && f13 && f14 && f15 && f16 && f17 && f18 && f19 && f20 && f21 && f22 & f23 & f24 & f25 & f26 & f27) 
	{
    //Balloon is GREENLIGHT!
		var greenlight = $("#greenlight");
   	greenlight.prop('checked', true);
    greenlight.trigger('change');
		$("#custom-quote").prop('checked', false);
    $("#custom-quote").trigger('change');
		
 
    	} else {
		//Balloon is REDLIGHT
		var greenlight = $("#greenlight");
   		greenlight.prop('checked', false);
    		greenlight.trigger('change');
		$("#custom-quote").prop('checked', true);
    		$("#custom-quote").trigger('change');
		
	}
  }
  //compliant
    if(compliant) {
    //Set Compliant Burst Menu
    $(".non-compliant-burst").css('display', 'none');
    $(".compliant-burst").css('display', 'flex'); 
        if(f1 && f2 && f3 && f4 && f5 && f6 && f7 && f8 && f9 && f10 && f11 && f12 && f13 && f14 && f15 && f16 && f17 && f18 && f19 && f20 && f21 && f22 & f23 & f24 & f25 & f26 & f27) 
	{
		//Balloon is greenlight!
		var greenlight = $("#greenlight");
   	greenlight.prop('checked', true);
    greenlight.trigger('change');
		$("#custom-quote").prop('checked', false);
    $("#custom-quote").trigger('change');	
		

	} else {
		//Balloon is REDLIGHT
		var greenlight = $("#greenlight");
   		greenlight.prop('checked', false);
    		greenlight.trigger('change');
		$("#custom-quote").prop('checked', true);
    		$("#custom-quote").trigger('change');
		
	}
  }
} // END CALCULATE

//VALIDATION

//HANDLE GREENLIGHT CHANGES
$("#greenlight").on('change', function() {
if(this.checked){
  $("#price-block").css('display', 'flex');
  $("#custom-dialogue").css('display', 'none');
} else {
  $("#price-block").css('display', 'none');
}
  
});
//END HANDLE GREENLIGHT CHANGES

//LIGHT - DARK MODE
$('#mode').on('change', function() {
if($(this).is(":checked")) {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol,.cone-tol").addClass('light-text');
$('.image-171,.image-167').addClass('reverse');
$('.column-7').addClass('white-background');
$('.text-field-3.tol,.divider,.cone-tol').addClass('gray-background');
$('.slim').addClass('no-border');
$('.range-slider').addClass('light-border');
$('#add-extrusion').addClass('blue-button');
sphereController.setValue("#e0e0e0");
$('.price-line').removeClass('chosen');
$('input[data-name=price]:checked').trigger('change');
} else {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol,.cone-tol").removeClass('light-text');
$('.image-171,.image-167').removeClass('reverse');
$('.column-7').removeClass('white-background');
$('.text-field-3.tol,.divider,.cone-tol').removeClass('gray-background');
$('.slim').removeClass('no-border');
$('.range-slider').removeClass('light-border');
$('#add-extrusion').removeClass('blue-button');
sphereController.setValue("#333");
$('.price-line').removeClass('chosen-light');
$('input[data-name=price]:checked').trigger('change');
}
});
//END LIGHT - DARK MODE

//HANDLE ACTIVE PRICE TARGET
$('input[data-name=price]').on('change', function() {
  if($("#mode").is(":checked")) {
  $('.price-line').removeClass('chosen-light');
  $(this).closest('div').addClass('chosen-light');
  } else {
  $('.price-line').removeClass('chosen');
  $(this).closest('div').addClass('chosen'); 
  }
  $("#apply-expedite").trigger('change');
});
//END  HANDLE ACTIVE PRICE TARGET


$("#cert-0-dialog").click(function(){ $("#cert-0").dialog("open"); });
$("#cert-1-dialog").click(function(){ $("#cert-1").dialog("open"); });
$("#cert-2-dialog").click(function(){ $("#cert-2").dialog("open"); });
$("#cert-3-dialog").click(function(){ $("#cert-3").dialog("open"); });
$("#qty-popup").click(function(){ $("#qty-dialog").dialog("open"); });




  








//ACTIVITY REPORTING
$(".updater").on('focusout mouseup', function() {
  var step = this.id + ' changed to: ' + this.value;
  updateJourney(step);
});
//END ACTIVITY REPORTING
$("#SUGGESTED-DIST-ID").on('change', function() {
  if ($(this).is(":checked")) {
    $("#DIST-ID-HOLDER").css({"pointer-events":"none", "opacity": 0.1});
  } else {
    $("#DIST-ID-HOLDER").css({"pointer-events":"auto", "opacity": 1});
  }
});
$("#SUGGESTED-PROX-ID").on('change', function() {
  if ($(this).is(":checked")) {
    $("#PROX-ID-HOLDER").css({"pointer-events":"none", "opacity": 0.1});
  } else {
    $("#PROX-ID-HOLDER").css({"pointer-events":"auto", "opacity": 1});
  }
});
// $("#DIST-OD-RANGE").on('input', function() {
//   if(Number(this.value) - Number($("#DWT").val()) < Number($("#DIST-ID").val())) {
//     $("#DIST-ID-RANGE").val(Number(this.value) - Number($("#DWT").val())).trigger("input");
//   }
// });
// $("#PROX-OD-RANGE").on('input', function() {
//   if(Number(this.value) - Number($("#DWT").val()) < Number($("#PROX-ID").val())) {
//     $("#PROX-ID-RANGE").val(Number(this.value) - Number($("#DWT").val())).trigger("input");
//   }
// });
// $("#DIST-ID-RANGE").on('input', function() {
//   if(Number(this.value) + Number($("#DWT").val()) > Number($("#DIST-OD").val())) {
//     $("#DIST-OD-RANGE").val(Number(this.value) + Number($("#DWT").val())).trigger("input");
//   }
// });
// $("#PROX-ID-RANGE").on('input', function() {
//   if(Number(this.value) + Number($("#DWT").val()) > Number($("#PROX-OD").val())) {
//     $("#PROX-OD-RANGE").val(Number(this.value) + Number($("#DWT").val())).trigger("input");
//   }
// });

$("#custom-quantity").on('change', function() {
  if(this.value < 101) {$("#custom-quantity").val(101)}
  var step = 'QTY changed to: ' + this.value;
  updateJourney(step);
});
$("#QUANTITY").on('change', function() {
if(this.value == 'More') {
$("#custom-quantity").css('display', 'block');
} else {
$("#custom-quantity").css('display', 'none');
}
//calculate(true);
var step = 'QTY changed to: ' + this.value;
updateJourney(step);
});

$("#dist-wt-notice").on("click", function() {
  $("#dist-wt-details-dialog").dialog("open");
});

$("#prox-wt-notice").on("click", function() {
  $("#prox-wt-details-dialog").dialog("open");
});

$("#MATERIAL").on('change', function() {
  if(['Pellethane 80A','Pellethane 90A'].includes($("#MATERIAL").val())) {
    $("#DIAMETER-TOL").attr("type", "text");
    $("#DIAMETER-TOL").val('MIN');
  } else {
    $("#DIAMETER-TOL").attr("type", "number");
    $("#DIAMETER-TOL").val('0.5');
  }
  var step = 'Material changed to: ' + this.value;
  updateJourney(step);
  $(this).css('border', '0px');
 calculate();

});


$("input[name=cert]").on('click', function() {
 var step = 'Cert changed to:' + this.id;
 updateJourney(step); 
});
$("input[name=price]").on('click', function() {
 var step = 'Leadtime changed to:' + this.id;
 updateJourney(step); 
});




function takeScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
//scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob); 
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
}
a.href = url;
a.download = 'Extrusion.png';
a.click();
}, 'image/png', 1.0);

bg.visible = true;
}
function sendScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
//scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob);
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
$("#screenshot").val(base64data);
}
}, 'image/png', 1.0);
bg.visible = true;
}
$(window).keydown(function(event){
if(event.keyCode == 13) {
event.preventDefault();
return false;
}
});

function exportBinary() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
//var len = $("#length-2").val();
//lengthController.setValue(len);
var obj = scene.getObjectByName( "obj" );
const result = exporter.parse( obj, { binary: true } );
saveArrayBuffer( result, 'balloon.stl' );
//lengthController.setValue(0.2);
bg.visible = true;
}
function save( blob, filename ) {
const link = document.createElement( 'a' );
link.href = URL.createObjectURL( blob );
link.download = filename;
link.click();
}
function saveArrayBuffer( buffer, filename ) {
save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}



function storeHistory() {
  if(sessionStorage.getItem("history") !== null) {
  sessionStorage.removeItem("history");
  sessionStorage.removeItem("rewards");
  }
  var previous = $("#quote").html();
  var previousReward = Number($("#reward-counter").val());
  sessionStorage.setItem("history", previous);
  sessionStorage.setItem("rewards", previousReward);
}

function getHistory() {
  var history = sessionStorage.getItem("history");
  if(history !== null) {
    if (confirm("Looks like you were already working on a quote, would you like to pick up where you left off?") == true) {
      $("#quote").empty().append(history);
      $("#quote-panel").css('display', 'flex');
      $(".lil-gui").addClass('hide-price');
       var getTotal = $(".price-item");
       var total = 0;
       for(var i = 0; i < getTotal.length; i++){
       total += Number($(getTotal[i]).val());
       }
      var shippingTotal = Number($("#shipping-total").val());
      $("#total-text").text(total + shippingTotal);
      $("#continue-to-checkout").removeClass('hide-price');
      styles();
      updateTotal();
      if (user.model?.expand?.blanket_po){
      updateBlanket();
      }
      var totalExpedites = Number(sessionStorage.getItem("rewards"));
      var expeditesInQuote = $(document).find('.expedited:checked').length;
      if ( totalExpedites > 0 ) {
      $("#reward-counter").val(totalExpedites);
      $("#expedites-remaining").text(totalExpedites);
      $("#reward-box").removeClass('hide-price');
      } else {
      $("#reward-box").addClass('hide-price');
      }
    } else {
      sessionStorage.removeItem("history");
      sessionStorage.removeItem("rewards");
    }
  }
}
getHistory();
function createLine(){
var find = $(".line");
var lineItem = find.length +1
var MATERIAL = $("#MATERIAL").val(); 
 if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D'].includes(MATERIAL)) {
   var BURST1 = `<div class="item"><p class="label">Requested Burst</p><input class="quote-input" id="l`+lineItem+`-REQUESTED-BURST" value="`+Number($("#REQUESTED-BURST").val())+`" readonly></input></div>`
   var BURST2 = `<div class="item"><p class="label">Requested Fatigue</p><input class="quote-input" id="l`+lineItem+`-REQUESTED-FATIGUE" value="`+Number($("#REQUESTED-FATIGUE").val())+`" readonly></input></div>`
 } else {
   var BURST1 = `<div class="item"><p class="label">Requested Nominal Vol</p><input class="quote-input" id="l`+lineItem+`-REQUESTED-VOLUME" value="`+Number($("#REQUESTED-VOLUME").val())+`" readonly></input></div>`
   var BURST2 = `<div class="item"><p class="label">Requested Min Burst Vol</p><input class="quote-input" id="l`+lineItem+`-REQUESTED-MIN-VOLUME" value="`+Number($("#REQUESTED-MIN-VOLUME").val())+`" readonly></input></div>`
 }
var DIAMETER = Number($("#DIAMETER").val());
var DIAMETER_TOL = $("#DIAMETER-TOL").val();
var LEN = Number($("#LEN").val());
var LEN_TOL = Number($("#LEN-TOL").val());

if($("#DIST-CURVE").is(':checked')) {
  var DIST_CONE = 'Rounded'; 
  var DIST_CONE_TOL = `<div class="item"><p class="label">Distal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-CONE-TOL" value="" readonly style="display:none"></input></div>`;
} else {
  var DIST_CONE = Number($("#DIST-CONE").val());
  var DIST_CONE_TOL = `<div class="item"><p class="label">Distal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-CONE-TOL" value="`+Number($("#DIST-CONE-TOL").val())+`" readonly></input></div>`
}

var DIST_OD = Number($("#DIST-OD").val());
var DIST_OD_TOL = Number($("#DIST-OD-TOL").val());

var DIST_ID_TOL = Number($("#DIST-ID-TOL").val());
var DIST_NECK = Number($("#DIST-NECK").val());
var DIST_NECK_TOL = $("#DIST-NECK-TOL").val();

if($("#PROX-CURVE").is(':checked')) {
  var PROX_CONE = 'Rounded'; 
  var PROX_CONE_TOL = `<div class="item"><p class="label">Proximal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-CONE-TOL" value="" readonly style="display:none"></input></div>`;
} else {
  var PROX_CONE = Number($("#PROX-CONE").val());
  var PROX_CONE_TOL = `<div class="item"><p class="label">Proximal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-CONE-TOL" value="`+Number($("#PROX-CONE-TOL").val())+`" readonly></input></div>`
}

var PROX_OD = Number($("#PROX-OD").val());
var PROX_OD_TOL = Number($("#PROX-OD-TOL").val());

var PROX_ID_TOL = Number($("#PROX-ID-TOL").val());
var PROX_NECK = Number($("#PROX-NECK").val());
var PROX_NECK_TOL = $("#PROX-NECK-TOL").val();
var PROX_CURVE = $("#PROX-CURVE").is(':checked');
var DIST_CURVE = $("#DIST-CURVE").is(':checked');
var DWT = Number($("#DWT").val());
var DWT_TOL = Number($("#DWT-TOL").val());
var RADIUS = Number($("#RADIUS").val());

if($("#apply-expedite").is(":checked")) {
  var expedite = `style="display: block;margin-right:5px;" checked`;
  var label = `style="display:flex;"`;
  } else {
  var expedite = `style="display:none;margin-right:5px;"`;
  var label = `style="display:none;"`;
  }
  
if($("#SUGGESTED-DIST-ID").is(":checked")) {
  var suggestedDistID = `suggested="true"`;
  var DIST_ID = Number($("#DIST-ID").val()) + ' (auto-set)';
} else {
  var suggestedDistID = `suggested="false"`;
  var DIST_ID = Number($("#DIST-ID").val());
}

if($("#SUGGESTED-PROX-ID").is(":checked")) {
  var suggestedProxID = `suggested="true"`;
  var PROX_ID = Number($("#PROX-ID").val()) + ' (auto-set)';
} else {
  var suggestedProxID = `suggested="false"`;
  var PROX_ID = Number($("#PROX-ID").val());
}
  
if($("#QUANTITY").val() == 'More') {
  var quantity = $("#custom-quantity").val();
} else {
  var quantity = $("#QUANTITY").val();
}
var cert = $('input[data-name=cert]:checked').val();
var unit = $("#unit").val();
var price = $('#'+ $('input[data-name=price]:checked').val()).val();
var leadtime =  $('input[data-name=price]:checked').val();
if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
if(!$("#custom-quote").is(":checked")){
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-LEN" value="`+LEN+`" readonly></input></div>
    <div class="item"><p class="label">Diameter</p><input class="quote-input" id="l`+lineItem+`-DIAMETER" value="`+DIAMETER+`" readonly></input></div>
  	<div class="item"><p class="label">DWT</p><input class="quote-input line-length" id="l`+lineItem+`-DWT" value="`+DWT+`" readonly></input></div>
    <div class="item"><p class="label">Dist OD</p><input class="quote-input" id="l`+lineItem+`-DIST-OD" value="`+DIST_OD+`" readonly></input></div>
    <div class="item"><p class="label">Dist ID</p><input `+suggestedDistID+` class="quote-input" id="l`+lineItem+`-DIST-ID" value="`+DIST_ID+`" readonly></input></div>
    <div class="item"><p class="label">Dist Neck Length</p><input class="quote-input" id="l`+lineItem+`-DIST-NECK" value="`+DIST_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Dist Cone</p><input class="quote-input" id="l`+lineItem+`-DIST-CONE" value="`+DIST_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Prox OD</p><input class="quote-input" id="l`+lineItem+`-PROX-OD" value="`+PROX_OD+`" readonly></input></div>
    <div class="item"><p class="label">Prox ID</p><input `+suggestedProxID+` class="quote-input" id="l`+lineItem+`-PROX-ID" value="`+PROX_ID+`" readonly></input></div>
    <div class="item"><p class="label">Prox Neck Length</p><input class="quote-input" id="l`+lineItem+`-PROX-NECK" value="`+PROX_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Prox Cone</p><input class="quote-input" id="l`+lineItem+`-PROX-CONE" value="`+PROX_CONE+`" readonly></input></div>
    `+BURST1+`
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-MATERIAL" value="`+MATERIAL+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;"></input>
    <label class="label" `+ label +`><input type="checkbox" class="expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-LEN-TOL" value="`+LEN_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Diameter Tol</p><input class="quote-input" id="l`+lineItem+`-DIAMETER-TOL" value="`+DIAMETER_TOL+`" readonly></input></div>
    <div class="item"><p class="label">DWT Tol</p><input class="quote-input" id="l`+lineItem+`-DWT-TOL" value="`+DWT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist OD Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-OD-TOL" value="`+DIST_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist ID Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-ID-TOL" value="`+DIST_ID_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist Neck Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-NECK-TOL" value="`+DIST_NECK_TOL+`" readonly></input></div>
    `+DIST_CONE_TOL+`
    <div class="item"><p class="label">Prox OD Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-OD-TOL" value="`+PROX_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Prox ID Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-ID-TOL" value="`+PROX_ID_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Prox Neck Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-NECK-TOL" value="`+PROX_NECK_TOL+`" readonly></input></div>
    `+PROX_CONE_TOL+`
    `+BURST2+`
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
    
  </div>
  </div>
</div>`;} else {
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-LEN" value="`+LEN+`" readonly></input></div>
    <div class="item"><p class="label">Diameter</p><input class="quote-input" id="l`+lineItem+`-DIAMETER" value="`+DIAMETER+`" readonly></input></div>
  	<div class="item"><p class="label">DWT</p><input class="quote-input line-length" id="l`+lineItem+`-DWT" value="`+DWT+`" readonly></input></div>
    <div class="item"><p class="label">Dist OD</p><input class="quote-input" id="l`+lineItem+`-DIST-OD" value="`+DIST_OD+`" readonly></input></div>
    <div class="item"><p class="label">Dist ID</p><input `+suggestedDistID+` class="quote-input" id="l`+lineItem+`-DIST-ID" value="`+DIST_ID+`" readonly></input></div>
    <div class="item"><p class="label">Dist Neck Length</p><input class="quote-input" id="l`+lineItem+`-DIST-NECK" value="`+DIST_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Distal Cone</p><input class="quote-input" id="l`+lineItem+`-DIST-CONE" value="`+DIST_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Prox OD</p><input class="quote-input" id="l`+lineItem+`-PROX-OD" value="`+PROX_OD+`" readonly></input></div>
    <div class="item"><p class="label">Prox ID</p><input `+suggestedProxID+` class="quote-input" id="l`+lineItem+`-PROX-ID" value="`+PROX_ID+`" readonly></input></div>
    <div class="item"><p class="label">Prox Neck Length</p><input class="quote-input" id="l`+lineItem+`-PROX-NECK" value="`+PROX_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Prox Cone</p><input class="quote-input" id="l`+lineItem+`-PROX-CONE" value="`+PROX_CONE+`" readonly></input></div>
    `+BURST1+`
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-MATERIAL" value="`+MATERIAL+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;" checked></input>
    <label class="label" `+ label +`><input type="checkbox" class="expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-LEN-TOL" value="`+LEN_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Diameter Tol</p><input class="quote-input" id="l`+lineItem+`-DIAMETER-TOL" value="`+DIAMETER_TOL+`" readonly></input></div>
    <div class="item"><p class="label">DWT Tol</p><input class="quote-input" id="l`+lineItem+`-DWT-TOL" value="`+DWT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist OD Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-OD-TOL" value="`+DIST_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist ID Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-ID-TOL" value="`+DIST_ID_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Dist Neck Tol</p><input class="quote-input" id="l`+lineItem+`-DIST-NECK-TOL" value="`+DIST_NECK_TOL+`" readonly></input></div>
    `+DIST_CONE_TOL+`
    <div class="item"><p class="label">Prox OD Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-OD-TOL" value="`+PROX_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Prox ID Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-ID-TOL" value="`+PROX_ID_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Prox Neck Tol</p><input class="quote-input" id="l`+lineItem+`-PROX-NECK-TOL" value="`+PROX_NECK_TOL+`" readonly></input></div>
    `+PROX_CONE_TOL+`
    `+BURST2+`
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
  </div>
  </div>
</div>`;  
}
 
$("#quote").append(lineHtml);
storeHistory();
  

if (user.model?.expand?.blanket_po){
 
updateBlanket();
}
updateTotal();
}
//END CREATE LINE

function updateBlanket() {
updateTotal();
var total = Number($("#total-price").val());
$("#blanket-value").text($("#selectedBlanket").val());
$("#remaining").text(Number($("#selectedBlanket").val()) - total);
$("#order-price").text(total);
if ( Number($("#selectedBlanket").val()) - total <= -10000 ) {
  $("#open-blanket").addClass('hide-price');
  $("#blanket-box").addClass('hide-price');
  $("#po-details").append(`<a href="mailto:`+user.model.sales_rep+`"><p class="text-block-39 center">Blanket PO has been exhausted. Click here to contact your rep.</p></a>`);
}
$("#blanket-po-number").val($('#selectedBlanket option:selected').attr('recordid'));  
$("#new-blanket-po-amount").val($("#remaining").text());
}
$("#selectedBlanket").on('change', function(){
  updateBlanket();
  var step = 'Blanket PO has been changed to: ' + this.value;
  updateJourney(step); 
});

//STYLES
function styles() {
  var lineItem = 1;
  var greenlight = $(".line-greenlight");
  for(var i = 0; i < greenlight.length; i++){
    if ($(greenlight[i]).is(":checked")) {
    var line = $(greenlight[i]).closest('.line');
    //line.find('.quote-input').addClass('red-input');
    line.addClass('red-line');
    line.find('.input-remove').addClass('hide-price');
    }
    else {
    var line = $(greenlight[i]).closest('.line');
    //line.find('.quote-input').removeClass('red-input');
    line.removeClass('red-line');
    line.find('.input-remove').removeClass('hide-price');
    }
  }
  if($('.line-greenlight:checkbox:checked').length > 0) {
  
    $("#view-quote").text("View Custom Quote");
    $("#view-quote").closest('div').css('background-color', '#f06f59');
    $('input[id="final-check"]').prop("checked", false);
    $("#final-check-text").val(false);
  } else {
  
    $("#view-quote").text("View Instant Quote");
    $("#view-quote").closest('div').css('background-color', '#91c765');
    $('input[id="final-check"]').prop("checked", true);
    $("#final-check-text").val(true);
  }
  var leadtime =$(".line-leadtime");
  for(var i = 0; i < leadtime.length; i++){
    if ($(leadtime[i]).val() == '2-day') {  
      
      if ( user.model?.credit_terms == false ) {
      $("#view-po").addClass('hide-price');
      } else {
      $("#view-po").removeClass('hide-price');
      }
      return;
    } else {
      $("#view-po").removeClass('hide-price');
    }
  }
  
}
//END STYLES


$("#add-extrusion").click(function() {
if($("#MATERIAL").val() == '') {$("#MATERIAL").css('border', '3px solid #ff6f6f');$("#MATERIAL").get(0).scrollIntoView(); $("#greenlight").prop('checked', false); $("greenlight").trigger('change');  return;}
if ($("#greenlight").is(":checked")){
 if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
  if ($(".line").length >= 9) {
    $("#too-many-lines").dialog("open");
    return false;
  }
createLine();
styles();

if( $("#apply-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  var expeditesInQuote = $(document).find('.expedited:checked').length;
  var expeditesRemaining = Number($("#reward-counter").val()) - 1;
  if ( expeditesRemaining > 0 ) {
  $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
  $("#expedites-remaining").text(expeditesRemaining);
  } else {
  $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
  $("#expedites-remaining").text(expeditesRemaining);
  $("#reward-box").addClass('hide-price');
  }
  }
  
resetInputs();
$("#quote-panel").css('display', 'flex');
$("#left-panel-download").removeClass('hide-price');
$(".lil-gui").addClass('hide-price');
$("#price-block").css('display', 'none');
$("#level-0").prop('checked', true);
$("#next-step").removeClass('hide-price');
$("#continue-to-checkout").removeClass('hide-price');
} else {
  if($("#custom-quote").is(":checked")){
  $("#custom-dialogue").css('display', 'flex');
  } 
  //else { createLine(); $("#price-block").css('display', 'none'); $("#quote-panel").css('display', 'flex'); $(".lil-gui").addClass('hide-price'); styles();}
}
storeHistory();
var find = $(".line");
packageQuote();
var quoteContents = JSON.parse($("#order").val());
var message = {
  "number_of_lines": find.length,
  "quote_contents": quoteContents
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
 setTimeout(function() {
 var step = 'Line Added To Quote';
 updateJourney(step); 
}, 1000);


});

//Handle unit change
$("#unit").on('change', function() {
  var prevalues = [];
  var preTolValues = [];
  $(".dim").each(function(index){

      var preval = $(this).val();
      prevalues.push({value: preval});
    
  });
    $(".tol").each(function(index){

      var preTolVal = $(this).val();
      preTolValues.push({value: preTolVal});
    
  });
  
  if(this.value == 'in') {

  $("#LEN, #LEN-RANGE").attr({
    "min": 0,
    "max": 6.9,
    "step": 0.001
  });
  $("#LEN-TOL").attr({
    "min": 0,
    "step": 0.001
  });
  $("#DIAMETER, #DIAMETER-RANGE").attr({
    "min": 0.039,
    "max": 1,
    "step": 0.001
  });
  $("#DIAMETER-TOL").attr({
    "min": 0,
    "step": 0.001
  });
  $("#DWT, #DWT-RANGE").attr({
    "min": 0.0015,
    "max": 0.025,
    "step": 0.0005
  });
  $("#DWT-TOL").attr({
    "min": 0,
    "step": 0.0005
  });
  $("#DIST-OD, #DIST-OD-RANGE, #PROX-OD, #PROX-OD-RANGE").attr({
    "min": 0.02,
    "max": 0.275,
    "step": 0.001
  });
  $("#DIST-OD-TOL, #PROX-OD-TOL").attr({
    "min": 0,
    "step": 0.001
  });
  $("#DIST-ID, #DIST-ID-RANGE, #PROX-ID, #PROX-ID-RANGE").attr({
    "min": 0.02,
    "max": 0.275,
    "step": 0.001
  });
  $("#DIST-ID-TOL, #PROX-ID-TOL").attr({
    "min": 0,
    "step": 0.001
  });
  $("#DIST-NECK, #DIST-NECK-RANGE, #PROX-NECK, #PROX-NECK-RANGE").attr({
    "min": 0.078,
    "max": 1,
    "step": 0.039
  });
  $("#DIST-NECK-TOL, #PROX-NECK-TOL").attr({
    "min": 0,
    "step": 0.001
  });

    camera.position.set(-3, 5, 20).setLength(2);
    //controls.maxDistance = 50;
    
   //convert values
  $(".dim").each(function(index){
    if($(this).val() !== 'MIN') {
    if($(this).attr('id').includes("RANGE") ) {
    var val = Number(prevalues[index]["value"]) / 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change");
    }
    }
  });
  $(".tol").each(function(index){
    if($(this).val() !== 'MIN') {
    
    var val = Number(preTolValues[index]["value"]) / 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change");
    
    }
  });  
  } //end if in
  else {
  $("#LEN, #LEN-RANGE").attr({
    "min": 0,
    "max": 176,
    "step": 0.025
  });
  $("#LEN-TOL").attr({
    "min": 0,
    "step": 0.025
  });
  $("#DIAMETER, #DIAMETER-RANGE").attr({
    "min": 1,
    "max": 25,
    "step": 0.025
  });
  $("#DIAMETER-TOL").attr({
    "min": 0,
    "step": 0.025
  });
  $("#DWT, #DWT-RANGE").attr({
    "min": 0.0381,
    "max": 0.6096,
    "step": 0.0125
  });
  $("#DWT-TOL").attr({
    "min": 0,
    "step": 0.0125
  });
  $("#DIST-OD, #DIST-OD-RANGE, #PROX-OD, #PROX-OD-RANGE").attr({
    "min": 0.5,
    "max": 7,
    "step": 0.025
  });
  $("#DIST-OD-TOL, #PROX-OD-TOL").attr({
    "min": 0,
    "step": 0.025
  });
  $("#DIST-ID, #DIST-ID-RANGE, #PROX-ID, #PROX-ID-RANGE").attr({
    "min": 0.5,
    "max": 7,
    "step": 0.025
  });
  $("#DIST-ID-TOL, #PROX-ID-TOL").attr({
    "min": 0,
    "step": 0.025
  });
  $("#DIST-NECK, #DIST-NECK-RANGE, #PROX-NECK, #PROX-NECK-RANGE").attr({
    "min": 2,
    "max": 25,
    "step": 1
  });
  $("#DIST-NECK-TOL, #PROX-NECK-TOL").attr({
    "min": 0,
    "step": 0.025
  });
camera.position.set(-3, 5, 20).setLength(50);
 //convert values
  $(".dim").each(function(index){
    if($(this).val() !== 'MIN') {
    if($(this).attr('id').includes("RANGE")) {
    var val = Number(prevalues[index]["value"]) * 25.4;
    var step = Number($(this).attr('step'));
   
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec));
    $(this).trigger("change");
    }
    }
  });
     $(".tol").each(function(index){
    if($(this).val() !== 'MIN') {
    
    var val = Number(preTolValues[index]["value"]) * 25.4;
    var step = Number($(this).attr('step'));
 
    if(step.toString().includes('.')) {
      var dec = step.toString().split('.')[1].length;
    } else {
      var dec = step.toString().length;
    }
    $(this).val((Math.round(val / step) * step).toFixed(dec))
    $(this).trigger("change");
    
    }
  });  
  }
updateParams();
 
  
});



function resetInputs() {
  $("#apply-expedite").prop('checked', false);
  if(Number($("#reward-counter").val()) <= 0) {
  $("#reward-box").addClass('hide-price');
  }
  //if ( $("#unit").val() == 'mm' ) { $("#unit").val('in').trigger('change'); }
//   setTimeout(function() {
//   $("#LEN,#LEN-RANGE").val(10);   
//   $("#DIAMETER,#DIAMETER-RANGE").val(4);
//   $("#DWT,#DWT-RANGE").val(0.2);
//   $("#DIST-OD,#DIST-OD-RANGE").val(2);
//   $("#DIST-WT,#DIST-WT-RANGE").val(0.254);
//   $("#DIST-CONE,#DIST-CONE-RANGE").val(30);
//   $("#DIST-NECK,#DIST-NECK-RANGE").val(10);
//   $("#PROX-OD,#PROX-OD-RANGE").val(2);
//   $("#PROX-WT,#PROX-WT-RANGE").val(0.254);
//   $("#PROX-CONE,#PROX-CONE-RANGE").val(30);
//   $("#PROX-NECK,#PROX-NECK-RANGE").val(10);
//   $("#DIST-CURVE, #PROX-CURVE").prop('checked', false);
//   $("#LEN-TOL").val(1);
//   $("#DIAMETER-TOL").val(0.5);
//   $("#DWT-TOL").val(0.0127);
//   $("#DIST-OD-TOL, #PROX-OD-TOL").val(0.0762);
//   $("#DIST-WT-TOL, #PROX-WT-TOL").val(0.0254);
//   $("#DIST-CONE-TOL, #PROX-CONE-TOL").val(3);
  
//   $("#REQUESTED-BURST").val(20);
//   $("#REQUESTED-FATIGUE").val(10);
//   $("#REQUESTED-VOLUME").val("");
//   $("#REQUESTED-MIN-VOLUME").val("");
//   //might need to add .trigger('change') to these
// }, 500);

  
 
  
  $("#QUANTITY").val(25);
  $("#custom-quantity").val('');
  $("#custom-quantity").css('display','none');
 
 
  
  // $("#MATERIAL").val($("#MATERIAL option:first").val());
  $("#price-block").css('display', 'none');
  $("#carrier-details").addClass('hide-price');
  $("#view-carrier").text("Charge to your shipping account");
  $("#shipping-account").val("");
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#shipping-method").val($("#shipping-method option:first").val());
  // $("#LEN").trigger("input");
  
}


$("#custom-change").click(function() {
  
  $(".updater").css('border', 'none');
  $(".tol").css('border', '1px solid white');
  $("#custom-quote").prop('checked', true);
  $("#custom-quote").trigger('change');
  if($('#editing').css('display') == 'none') { createLine(); styles();$("#next-step").removeClass('hide-price');} else { update(); styles();}
  $("#quote-panel").css('display', 'flex');
  $(".lil-gui").addClass('hide-price');
  $("#custom-dialogue").css('display', 'none');
  $(".ui-dialog-content").dialog("close");
  resetInputs();
  var message = {
  "custom_line_added": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
});
$("#custom-quote").on('change', function() {
  if ($(this).is(":checked")) {
    
    $("#price-block").css('display', 'none');
    //document.querySelectorAll('.input-remove').forEach(e => e.hide());
    
    //$(".updater, .tol").removeClass("error");
  }
});

$("#continue,#continue-to-checkout,#editContinue").click(function() {
  styles();
  if($('input[id="final-check"]').is(":checked")) {
  //Order is greenlight
  $("#final-details").css('display', 'block');  
  $('html, body').animate({
        scrollTop: $("#final-details").offset().top
    }, 2000);
    updateTotal();
    if (user.model?.expand?.blanket_po){
    updateBlanket();
    }
  } else {
  //Order is custom
  $("#custom-menu").removeClass('hide-price');
  $('html, body').animate({
        scrollTop: $("#custom-menu").offset().top
    }, 2000);
  }
  
  $("#next-step").addClass('hide-price');
 var step = 'Continue to checkout clicked';
 updateJourney(step); 
});

$("#close-quote").click(function(){
  $(".lil-gui").removeClass('hide-price');
});

$("#open-quote").click(function(){
  $(".lil-gui").addClass('hide-price');
});
$("#close-terms").click(function(){
  $("#terms").addClass('hide-price');
});
$("#add-another").click(function(){
  $("#next-step").addClass('hide-price');
  $("#quote-panel").css('display', 'none');
  $(".lil-gui").removeClass('hide-price');
  var step = 'Add another extrusion was clicked';
  updateJourney(step); 
});

$("#view-carrier").click(function() {
  if($("#carrier-details").hasClass('hide-price')) {
  $("#carrier-details").removeClass('hide-price');
  $(this).text("I don't want to use my shipping account");
  $("#shipping-account").val($("#account-number").val());
  if($("#custom-carrier").val()) {$("#shipping-carrier").val($("#custom-carrier").val());};
  } else {
  $("#carrier-details").addClass('hide-price');
  $(this).text('Charge to your shipping account');
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  }
  $("#shipping-carrier").trigger("change");
   var step = 'Custom shipping toggled';
   updateJourney(step); 
});
$("#shipping-method").on('change', function() {
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#carrier-details").addClass('hide-price');

 var step = 'Shipping method changed to:' + this.value;
 updateJourney(step); 

});
$("#view-po").click(function() {
  $("#po-details").css('display', 'flex');
  var step = 'PO selected as checkout method';
  updateJourney(step); 
});

$("#shipping-carrier").on('change', function() {
  if(this.value == 'UPS') {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="UPS Ground">UPS Ground</option><option value="UPS 2nd Day Air">UPS 2nd Day Air</option><option value="UPS 3rd Day Select">UPS 3rd Day Select</option><option value="UPS Next Day Air">UPS Next Day Air</option><option value="UPS Worldwide Expedited">UPS Worldwide Expedited</option><option value="UPS Worldwide Saver">UPS Worldwide Saver</option>');
    
  } else {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="FedEx Ground">FedEx Ground</option><option value="FedEx Priority Overnight">FedEx Priority Overnight</option><option value="FedEx Standard Overnight">FedEx Standard Overnight</option><option value="FedEx 2 Day">FedEx 2 Day</option><option value="FedEx Express Saver">FedEx Express Saver</option><option value="FedEx International First">FedEx International First</option><option value="FedEx International Priority">FedEx International Priority</option><option value="FedEx International Priority Express">FedEx International Priority Express</option><option value="FedEx International Economy">FedEx International Economy</option>');
  }
 var step = 'Custom shipping carrier changed to: ' + this.value;
 updateJourney(step); 
});
$("#shipping-account").on('change', function() {
 var step = 'Shipping account number changed to :' + this.value;
 updateJourney(step); 
});
$("#custom-method").on('change', function() {
 var step = 'Custom shipping method changed to: ' + this.value;
 updateJourney(step); 
});
$(document).on("click", ".edit", function(){
//resetInputs();
var line = this.id;
if($("#l"+ line + "-DIST-ID").attr("suggested") == 'true') {
  $("#SUGGESTED-DIST-ID").prop('checked', true);
} else {
  $("#SUGGESTED-DIST-ID").prop('checked', false);
}
  $("#SUGGESTED-DIST-ID").trigger("change");
if($("#l"+ line + "-PROX-ID").attr("suggested") == 'true') {
  $("#SUGGESTED-PROX-ID").prop('checked', true);
} else {
  $("#SUGGESTED-PROX-ID").prop('checked', false);
}
  $("#SUGGESTED-PROX-ID").trigger("change");
$("#next-step").addClass('hide-price');
$("#final-details").css('display', 'none');
$("#custom-menu").addClass('hide-price');

$(".line").not("#line"+line).addClass('opacity');
$("#custom-quote").prop("checked",($("#l"+ line + "-greenlight").is(":checked")));
var previousUnit = $("#unit").val();
$("#unit").val($("#l"+ line + "-unit").val());
$("#unit").trigger('change', [previousUnit]);
//FOR BALLOONS SPECIFICALLY
$("#LEN, #LEN-RANGE").val($("#l"+ line + "-LEN").val());
$("#LEN-TOL").val($("#l"+ line + "-LEN-TOL").val());
$("#DIAMETER, #DIAMETER-RANGE").val($("#l"+ line + "-DIAMETER").val());
$("#DIAMETER-TOL").val($("#l"+ line + "-DIAMETER-TOL").val());
$("#DWT, #DWT-RANGE").val($("#l"+ line + "-DWT").val());
$("#DWT-TOL").val($("#l"+ line + "-DWT-TOL").val());
  
$("#DIST-OD, #DIST-OD-RANGE").val($("#l"+ line + "-DIST-OD").val());
$("#DIST-OD-TOL").val($("#l"+ line + "-DIST-OD-TOL").val());
$("#DIST-ID, #DIST-ID-RANGE").val(parseFloat($("#l"+ line + "-DIST-ID").val()));
$("#DIST-ID-TOL").val($("#l"+ line + "-DIST-ID-TOL").val());
$("#DIST-NECK, #DIST-NECK-RANGE").val($("#l"+ line + "-DIST-NECK").val());
$("#DIST-NECK-TOL").val($("#l"+ line + "-DIST-NECK-TOL").val());
if($("#l"+ line + "-DIST-CONE").val() == 'Rounded') {
  $("#DIST-CURVE").prop('checked', true).trigger('change');
} else {
  $("#DIST-CURVE").prop('checked', false).trigger('change');
  $("#DIST-CONE, #DIST-CONE-RANGE").val($("#l"+ line + "-DIST-CONE").val());
  $("#DIST-CONE-TOL").val($("#l"+ line + "-DIST-CONE-TOL").val());
}
$("#PROX-OD, #PROX-OD-RANGE").val($("#l"+ line + "-PROX-OD").val());
$("#PROX-OD-TOL").val($("#l"+ line + "-PROX-OD-TOL").val());
$("#PROX-ID, #PROX-ID-RANGE").val(parseFloat($("#l"+ line + "-PROX-ID").val()));
$("#PROX-ID-TOL").val($("#l"+ line + "-PROX-ID-TOL").val());
$("#PROX-NECK, #PROX-NECK-RANGE").val($("#l"+ line + "-PROX-NECK").val());
$("#PROX-NECK-TOL").val($("#l"+ line + "-PROX-NECK-TOL").val());
if($("#l"+ line + "-PROX-CONE").val() == 'Rounded') {
  $("#PROX-CURVE").prop('checked', true).trigger('change');
} else {
  $("#PROX-CURVE").prop('checked', false).trigger('change');
  $("#PROX-CONE, #PROX-CONE-RANGE").val($("#l"+ line + "-PROX-CONE").val());
  $("#PROX-CONE-TOL").val($("#l"+ line + "-PROX-CONE-TOL").val());
}

  
$("#MATERIAL").val($("#l"+ line + "-MATERIAL").val()).trigger('change');
if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D'].includes($("#MATERIAL").val())) {
  $("#REQUESTED-BURST").val($("#l"+ line + "-REQUESTED-BURST").val());
  $("#REQUESTED-FATIGUE").val($("#l"+ line + "-REQUESTED-FATIGUE").val());
} else {
  $("#REQUESTED-VOLUME").val($("#l"+ line + "-REQUESTED-VOLUME").val());
  $("#REQUESTED-MIN-VOLUME").val($("#l"+ line + "-REQUESTED-MIN-VOLUME").val());
}

if(Number($("#l"+ line + "-quantity").val()) > 100) {
  $("#custom-quantity").css('display', 'block');
  $("#QUANTITY").val('More');
  $("#custom-quantity").val(Number($("#l"+ line + "-quantity").val()));
} else {
  $("#QUANTITY").val($("#l"+ line + "-quantity").val()); 
}  
$("#editing").css('display', 'flex');
$("#now-editing").val(line);
$(".update, .update-button").css('display', 'flex');
   if(!$("#l" + line +  "-greenlight").is(":checked")){
//var radioId = $("#l"+line+"-leadtime").val().replace('-price','');
var radioId = $("#l"+line+"-leadtime").val();
var certId = $("#l"+line+"-cert").val();
$("#"+radioId).prop('checked', true).trigger('change');
$("#level-"+certId).prop('checked', true);
   }


if($("#l"+ line + "-shipping").attr("account").length > 0) {
  $("#carrier-details").removeClass('hide-price');
  $("#view-carrier").text("I don't want to use my shipping account");
  $("#shipping-carrier").val($("#l"+ line + "-shipping").attr("carrier")).trigger('change');
  $("#shipping-account").val($("#l"+ line + "-shipping").attr("account"));
  $("#custom-method").val($("#l"+ line + "-shipping").attr("method"));
  $("#shipping-method").val($("#shipping-method option:first").val());
  
} else {
   $("#carrier-details").addClass('hide-price');
   $("#view-carrier").text("Charge to your shipping account");
   $("#shipping-method").val($("#l"+ line + "-shipping").attr("method"));
   $("#shipping-account").val("");
   $("#custom-method").val($("#custom-method option:first").val());
   $("#shipping-carrier").val($("#shipping-carrier option:first").val());
}
  
$("#submit-container").css('display', 'none');
  
  
  //calculate(false);
  if($("#l" + line +  "-greenlight").is(":checked")){
    $("#price-block").css('display', 'none');
  } else {
    $("#price-block").css('display', 'flex');
  }
  
  
if( $("#l"+ line + "-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  $("#reward-box").removeClass("hide-price");
  var expeditesRemaining = Number($("#reward-counter").val()) + 1;
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  $("#apply-expedite").prop('checked', true).trigger('change');
}
 var step = 'A quote line was edited';
 updateJourney(step); 
  updateParams();
});


function update() {
var line = $("#now-editing").val();
$("#l"+ line + "-unit").val($("#unit").val());
$("#line"+line).find('.line-title').text("Line "+line+" ("+$("#unit").val()+")");


$("#l"+ line + "-LEN").val($("#LEN").val());
$("#l"+ line + "-LEN-TOL").val($("#LEN-TOL").val());
$("#l"+ line + "-DIAMETER").val($("#DIAMETER").val());
$("#l"+ line + "-DIAMETER-TOL").val($("#DIAMETER-TOL").val());
$("#l"+ line + "-DWT").val($("#DWT").val());
$("#l"+ line + "-DWT-TOL").val($("#DWT-TOL").val());
$("#l"+ line + "-DIST-OD").val($("#DIST-OD").val());
$("#l"+ line + "-DIST-OD-TOL").val($("#DIST-OD-TOL").val());

if($("#SUGGESTED-DIST-ID").is(":checked")) {
  $("#l"+ line + "-DIST-ID").attr("suggested", "true");
  $("#l"+ line + "-DIST-ID").val($("#DIST-ID").val() + ' (auto-set)');
} else {
  $("#l"+ line + "-DIST-ID").attr("suggested", "false");
  $("#l"+ line + "-DIST-ID").val($("#DIST-ID").val());
}
$("#l"+ line + "-DIST-ID-TOL").val($("#DIST-ID-TOL").val());
$("#l"+ line + "-DIST-NECK").val($("#DIST-NECK").val());
$("#l"+ line + "-DIST-NECK-TOL").val($("#DIST-NECK-TOL").val());

if($("#DIST-CURVE").is(':checked')) {
  $("#l"+ line + "-DIST-CONE").val('Rounded');
  $("#l"+ line + "-DIST-CONE-TOL").val("");
  $("#l"+ line + "-DIST-CONE-TOL").css('display','none');
} else {
  $("#l"+ line + "-DIST-CONE").val($("#DIST-CONE").val());
  $("#l"+ line + "-DIST-CONE-TOL").val($("#DIST-CONE-TOL").val());
  $("#l"+ line + "-DIST-CONE-TOL").css('display','block');
}
  
$("#l"+ line + "-PROX-OD").val($("#PROX-OD").val());
$("#l"+ line + "-PROX-OD-TOL").val($("#PROX-OD-TOL").val());

if($("#SUGGESTED-PROX-ID").is(":checked")) {
  $("#l"+ line + "-PROX-ID").attr("suggested", "true");
  $("#l"+ line + "-PROX-ID").val($("#PROX-ID").val() + ' (auto-set)');
} else {
  $("#l"+ line + "-PROX-ID").attr("suggested", "false");
  $("#l"+ line + "-PROX-ID").val($("#PROX-ID").val());
}
$("#l"+ line + "-PROX-ID-TOL").val($("#PROX-ID-TOL").val());
$("#l"+ line + "-PROX-NECK").val($("#PROX-NECK").val());
$("#l"+ line + "-PROX-NECK-TOL").val($("#PROX-NECK-TOL").val());

if($("#PROX-CURVE").is(':checked')) {
  $("#l"+ line + "-PROX-CONE").val('Rounded');
  $("#l"+ line + "-PROX-CONE-TOL").val("");
  $("#l"+ line + "-PROX-CONE-TOL").css('display','none');
} else {
  $("#l"+ line + "-PROX-CONE").val($("#PROX-CONE").val());
  $("#l"+ line + "-PROX-CONE-TOL").val($("#PROX-CONE-TOL").val());
  $("#l"+ line + "-PROX-CONE-TOL").css('display','block');
}
$("#l"+ line + "-MATERIAL").val($("#MATERIAL").val());
if(['Vestamid ML21','PET','Pebax 55D', 'Pebax 63D', 'Pebax 72D'].includes($("#MATERIAL").val())) {
  //IF the line already has non-compliant burst information
  if ($("#l"+ line + "-REQUESTED-BURST").length) {
  $("#l"+ line + "-REQUESTED-BURST").val($("#REQUESTED-BURST").val());
  $("#l"+ line + "-REQUESTED-FATIGUE").val($("#REQUESTED-FATIGUE").val());
  } 
  // IF it does not, change the ID of the COMPLIANT burst options and set their values.
  else {
  var burst1ID = 'l'+line+'-REQUESTED-BURST'
  var burst2ID = 'l'+line+'-REQUESTED-FATIGUE'
  $("#l"+ line + "-REQUESTED-VOLUME").prev().text('Requested Burst');
  $("#l"+ line + "-REQUESTED-MIN-VOLUME").prev().text('Requested Burst');
  $("#l"+ line + "-REQUESTED-VOLUME").attr("id",burst1ID).val($("#REQUESTED-BURST").val());
  $("#l"+ line + "-REQUESTED-MIN-VOLUME").attr("id",burst2ID).val($("#REQUESTED-FATIGUE").val());
  
  }
} else {
  if ($("#l"+ line + "-REQUESTED-VOLUME").length) {
  $("#l"+ line + "-REQUESTED-VOLUME").val($("#REQUESTED-VOLUME").val());
  $("#l"+ line + "-REQUESTED-MIN-VOLUME").val($("#REQUESTED-MIN-VOLUME").val());
  }
  else {
  var burst1ID = 'l'+line+'-REQUESTED-VOLUME'
  var burst2ID = 'l'+line+'-REQUESTED-MIN-VOLUME'
  $("#l"+ line + "-REQUESTED-BURST").prev().text('Requested Nominal Vol');
  $("#l"+ line + "-REQUESTED-FATIGUE").prev().text('Requested Min Burst Vol');
  $("#l"+ line + "-REQUESTED-BURST").attr("id",burst1ID).val($("#REQUESTED-VOLUME").val());
  $("#l"+ line + "-REQUESTED-FATIGUE").attr("id",burst2ID).val($("#REQUESTED-MIN-VOLUME").val());
  }
}

if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
$("#carrier-details").addClass('hide-price');
$("#l"+ line + "-shipping").val(shipping);
$("#l"+ line + "-shipping").attr("account", account);  
$("#l"+ line + "-shipping").attr("method", shipping);
$("#l"+ line + "-shipping").attr("carrier", carrier);  
  
if($("#QUANTITY").val() == 'More')  {
  $("#l"+ line + "-quantity").val($("#custom-quantity").val());
} else {
$("#l"+ line + "-quantity").val($("#QUANTITY").val());
}
 if(!$("#custom-quote").is(":checked")){
$("#l"+ line + "-cert").val($('input[data-name=cert]:checked').val());
$("#l"+ line + "-price").val($('#'+ $('input[data-name=price]:checked').val()).val());
$("#l"+ line + "-leadtime").val($('input[data-name=price]:checked').val().replace('-price', ''));
 }
$("#editing").css('display', 'none');
$(".update, .update-button").css('display', 'none');
$("#submit-container").css('display', 'flex');
$("#price-block").css('display', 'none');
$("#l"+ line + "-greenlight").prop("checked",($("#custom-quote").is(":checked")));
storeHistory();
updateTotal();
if ( $("#apply-expedite").is(":checked") ) {
  $("#l"+ line + "-expedite").prop('checked', true);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'flex')
  var expeditesRemaining = Number($("#reward-counter").val()) - 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  } else {
  $("#l"+ line + "-expedite").prop('checked', false);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'none')
}  
}

function updateTotal() {
  calcShipping();
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
  total += Number($(getTotal[i]).val());
}
var shippingTotal = Number($("#shipping-total").val());    
$("#total-price").val(total+shippingTotal);
$("#total-text").text(total+shippingTotal);
}

$("#update").click(function(){

update();
styles();
resetInputs();
$(".line").removeClass('opacity');
$("#next-step").removeClass('hide-price');
var step = 'A quote line was updated';
updateJourney(step); 
});

$(document).on("click", ".delete", function(){
  var lineId = $(this).attr('id');
  if( $("#l"+ lineId + "-expedite").is(":checked") ) {
  var expeditesRemaining = Number($("#reward-counter").val()) + 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  }
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    var unit = $(this).find('.unit').val();
    $(this).find('.line-title').first().text('Line '+ lineItem + ' (' + unit + ')');
    $(this).find('.linenumber').val(lineItem);
    $(this).find('.edit').first().attr("id", lineItem);
    $(this).find('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, lineItem);
      
    });
  ++lineItem;
  });
  storeHistory();
  updateTotal();
  if (user.model?.expand?.blanket_po){
  updateBlanket();
  }
 var step = 'A quote line was deleted';
 updateJourney(step); 
});

function calcShipping() {
var shippingLines = $(".shipping-line-item");
let finalShipping = [];


var priceMatchStandard = {
  "UPS Ground": 15,
  "UPS Second Day Air": 30,
  "UPS Next Day Air": 80,
  "UPS Worldwide Expedited": 75,
  "UPS Worldwide Saver": 90
};
for (let i = 0; i < shippingLines.length; ++i) {
  
  if ( !$(shippingLines[i]).attr("account").length > 0 ) {
  let shippingArray = {};
  var leadtime = 'leadtime';
  var shipping = 'shipping';
  var price = 'price';
  var line = $(shippingLines[i]).closest('.line');
  var leadVal = line.find('.line-leadtime').val();
  var shipVal = $(shippingLines[i]).val();
  var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchStandard[matched]);

  shippingArray[leadtime] = leadVal;
  shippingArray[shipping] = shipVal;
  shippingArray[price] = priceVal;
  finalShipping = finalShipping.concat(shippingArray);
  }
  
  
}

//let result = finalShipping.filter(
//  (finalShipping, index) => index === finalShipping.findIndex(
//    other => finalShipping.leadtime === other.leadtime
//      && finalShipping.shipping === other.shipping
//  ));

let result = finalShipping.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.leadtime === value.leadtime && t.shipping === value.shipping
  ))
)
  
var totalShipping = 0;
result.forEach(item => {
    totalShipping += Number(item.price);
});
if ( totalShipping > 0 ) {
   $("#shipping-total").val(totalShipping);
} else {
  $("#shipping-total").val('0');
}
  
}

function packageQuote() {
  
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    
$("#total-price").val(total); 
  /////////
  let order = [];
  var lines = $(".line");
  for (let i = 0; i < lines.length; ++i) {
    
    let line = {};
    var inputs = $("#"+lines[i].id).find('input');
    for (let a = 0; a < inputs.length; ++a) {
      
      var id = inputs[a].id;
      if (inputs[a].id.includes('greenlight') || inputs[a].id.includes('SPHERICAL') || inputs[a].id.includes('DIST-CURVE') || inputs[a].id.includes('PROX-CURVE') || inputs[a].id.includes('expedite')) {
      var value = $(inputs[a]).is(":checked");
      } else if ( inputs[a].id.includes('shipping') ) { 

      if ($(inputs[a]).attr("account").length > 0) { var acct = ' Account #: ' + $(inputs[a]).attr("account"); } else { var acct = ''; };
      var value = inputs[a].value + acct; 
        
      } else {
      var value = inputs[a].value;
      }
      //line.push({ [id] : value });
      line[id] = value;
    }
    order = order.concat(line);
    
}
var output = JSON.stringify(order);
$("#order").val(output); 
}

function createArray() {
packageQuote();
calcShipping();
 $("#quoteNum").val(sessionStorage.getItem("quoteNum"));
 $("#quoteId").val(sessionStorage.getItem("quoteId"));
 
 $("#shipping").val($("#shipping-method").val());
 $("#custom-carrier").val($("#shipping-carrier").val());
 //$("#account-number").val($("#shipping-account").val());
 $("#user-details").val(JSON.stringify(JSON.parse(localStorage.getItem("pocketbase_auth"))));
 $("#po-number-submit").val($("#purchase-order-file").val());
 $("#preferred-method").val($("#custom-method").val());
 //$("#po-file").val($("#purchase-order-file").val());
 sessionStorage.removeItem("history");
 sessionStorage.removeItem("rewards");
 $("#quote").submit();

}
$("#checkout").click(function() {

 var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    var fee = (total * 0.03).toFixed(2);
   
  ///////// Ad cc processing fee
var find = $(".line");
var message = {
  "number_of_lines": find.length,
  "submitted": true,
  "checkout_method": "CC"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
var lineItem = find.length + 1;
var lineHtml = 
`<div class="line" id="line`+lineItem+`" style="display:none;">
		<input class="quote-input" id="l`+lineItem+`-id" value="CC Processing Fee" readonly></input>
  	<input class="quote-input price-item" id="l`+lineItem+`-price" value="`+fee+`" readonly></input>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
</div>`;
   
$("#quote").append(lineHtml);  
  
 
  if( !$("#po-number").val() ) {
  $("#terms").removeClass('hide-price');
  
  }
  if( $("#po-number").val().length > 0) {
    if ($('input[id="po-verification"]').is(":checked")) { $("#terms").removeClass('hide-price'); }
    else {  $('#verification').dialog("open"); }
  } 
 var step = 'Credit Card checkout was selected';
 updateJourney(step); 
});

$("#upload-po").click(function() {
  $("#quote-panel").css('display','flex');
  $("#upload-container").removeClass('hide-price');
  $(this).fadeTo(1000, 1);
  $("#po-buy").fadeTo(1000, 0.2);
  var step = 'Customer has chosen to upload a PO now';
  updateJourney(step); 
});
$("#po-buy").click(function() {
  
  $("#po-accept").removeClass('hide-price');
  $(this).fadeTo(1000, 1);
  $("#upload-po").fadeTo(1000, 0.2);
  $("#po-checkout").addClass('hide-Price');
  var step = 'Customer has chosen to upload a PO later';
  updateJourney(step); 
});
$("#po-verification").click(function() {
  if($(this).is(":checked")) {
    $("#no-po-checkout").removeClass('hide-price');
  } else {
    $("#no-po-checkout").addClass('hide-price');
  }
});
$("#charge-to-blanket").click(function() {
  $("#terms").removeClass('hide-price');
  $("#blanket-po-selected").val(true);
  var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
 // $("#po-number-submit").val($("#blanket-number").text());
 var step = 'Customer has continued to terms with a blanket PO';
 updateJourney(step); 
});
$("#no-po-checkout").click(function() {
  if ($('input[id="po-verification"]').is(":checked")) { 
    $("#purchase-order-no-upload").val('no-upload'); 
    $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
  }
    else {  $('#verification').dialog("open"); }
 var step = 'Customer will upload PO later and has proceeded to terms';
 updateJourney(step);   
});
$("#send").click(function() {
 var message = {
    "order_placed": true,
    "ended": new Date()
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
createArray();
$("#loading").css("display", "flex");
 var step = 'Customer agreed to terms, order created';
 updateJourney(step); 
});
$("#po-checkout").click(function() {
   $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
  var step = 'Customer has uploaded PO and has proceeded to final terms';
  updateJourney(step); 
});
$("#purchase-order-file").on('change', function() {
  $("#upload-container").addClass('hide-price');
  $("#po-checkout").removeClass('hide-price');
  setTimeout(function() {
  $("#upload-po").text($(".text-block-57.w-file-upload-file-name").text());  
  }, 100);
  $("#upload-po").css('background-color', '#91c765');
  
});
$(".close-upload").click(function() {
  $("#upload-container").addClass('hide-price');
});
$("#po-checkout").click(function() {
   $("#terms").removeClass('hide-price');
});
$(".download-quote").click(function(){
  $("#download-quote").val('true');
  $("#loading").css("display", "flex");
  $("#save-quote").val("true");
  createArray();
  var step = 'A quote was saved for later';
  updateJourney(step); 
});
$("#continue-with-custom").click(function() {
  createArray();
  $("#loading").css("display", "flex");
  var find = $(".line");
  var message = {
  "number_of_lines": find.length,
  "submitted": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/balloon.html");
 var step = 'Redlight line added to quote';
 updateJourney(step); 
});
