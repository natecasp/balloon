import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
console.clear();
var sandbox = document.getElementById('sandbox');
let scene = new THREE.Scene();
let exporter;
let camera = new THREE.PerspectiveCamera(60, sandbox.offsetWidth / sandbox.offsetHeight, .1, 1000);
camera.position.set(-3, 5, 2).setLength(50);
let renderer = new THREE.WebGLRenderer({
  antialias: true
});
exporter = new STLExporter();
renderer.shadowMap.enabled = true;
renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
renderer.setClearColor(0xffffff, 0);
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
var light = new THREE.DirectionalLight( 'white', .2 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
controls.minDistance = .5;
controls.maxDistance = 200;

const amb = new THREE.AmbientLight( 'white', 1.5 ); // soft white light
scene.add( amb );
light.position.setScalar(1);
light.castShadow = true;
scene.add(light);
const gui = new GUI();
var params = {
      Diameter: 4,
      Length: 10,
      distConeAng: 30,
      distTailOd: 1,
      distTailWT: .0762,
      distTailLen: 10,
      proxConeAng: 30,
      proxTailOd: 1,
      proxTailWT:.0762,
      proxTailLen: 10,
      proxCurve: false,
      distCurve: false,
      WT: 0.01525,
      radius: 0.2
}
function updateParams() {
   
  params = {
      Diameter: Number($("#DIAMETER").val()),
      Length: Number($("#LEN").val()),
      distConeAng: Number($("#DIST-CONE").val()),
      distTailOd: Number($("#DIST-OD").val()),
      distTailWT: Number($("#DIST-WT").val()),
      distTailLen: Number($("#DIST-NECK").val()),
      proxConeAng: Number($("#PROX-CONE").val()),
      proxTailOd: Number($("#PROX-OD").val()),
      proxTailWT: Number($("#PROX-WT").val()),
      proxTailLen: Number($("#PROX-NECK").val()),
      proxCurve: $("#PROX-CURVE").is(':checked'),
      distCurve: $("#DIST-CURVE").is(':checked'),
      WT: Number($("#DWT").val()),
      radius: Number($("#RADIUS").val())
  }
  createShape();
}
$(".update").on('change', function() {
 updateParams();
  
});
const folder = gui.addFolder( 'Body' );
folder.add( params, 'Diameter', 0, 25, .25).onChange( createShape );   
//folder.add( params, 'bodyBottom', 0, 25, .01).onChange( createShape );
folder.add( params, 'Length', 0, 180, 1).onChange( createShape );
folder.add(params, 'WT', .01, .1).onChange(createShape)
            folder.open();

const distalFolder = gui.addFolder( 'Distal End' );
distalFolder.add( params, 'distConeAng', 3, 90, 1).name('Distal Cone Angle').onChange( createShape );
distalFolder.add( params, 'distTailOd', 0, 4, .01).name('Distal Tail OD').onChange( createShape );
distalFolder.add( params, 'distTailLen', 2, 100, 1).name('Distal Tail Length').onChange( createShape );
distalFolder.add( params , 'distCurve').name('Rounded').onChange(createShape);
distalFolder.add(params, 'distTailWT', 0, .2).onChange(createShape);
            distalFolder.open();

const proximalFolder = gui.addFolder( 'Proximal End' );
proximalFolder.add( params, 'proxConeAng', 3, 90, 1).name('Proximal Cone Angle').onChange( createShape );
proximalFolder.add( params, 'proxTailOd', 0, 4, .01).name('Proximal Tail OD').onChange( createShape );
proximalFolder.add( params, 'proxTailLen', 2, 100, 1).name('Proximal Tail Length').onChange( createShape );
proximalFolder.add( params , 'proxCurve').name('Rounded').onChange(createShape);
proximalFolder.add(params, 'proxTailWT', 0, .2).onChange(createShape);
            proximalFolder.open();



function createShape(latheAngle){

  
//PARAMETER MATH
//Hoop Ratio (diameter id / tail id)
var hoop = (params.Diameter - (params.WT*2)) / Math.min((params.proxTailOd - (params.proxTailWT*2)),(params.distTailOd - (params.distTailWT*2)))
console.log(hoop)
//END PARAMETER MATH
camera.position.set(-3, 5, 20).setLength(Math.max((params.Length*1.4), 50));  
if (params.proxCurve) {

var proxAngle = params.radius+((params.Diameter/2)-(params.proxTailOd/2));

} else {
var proxAngle = (((params.Diameter-params.proxTailOd)/2)*Math.tan((90-params.proxConeAng) * Math.PI/180));
}
if (params.distCurve) {
var distAngle = params.radius+((params.Diameter/2)-(params.distTailOd/2)); 

} else {
var distAngle = (((params.Diameter-params.distTailOd)/2)*Math.tan((90-params.distConeAng) * Math.PI/180));
}
  
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
path.arc(params.radius, 0, params.radius, Math.PI, Math.PI/2,true);
path.arc(0, (params.Diameter/2)-(params.proxTailOd/2)-(params.radius), (params.Diameter/2)-(params.proxTailOd/2)-(params.radius), -Math.PI/2, 0, false);
}
//Body
path.lineTo((params.Diameter/2),params.proxTailLen+proxAngle+params.Length)
//Distal Cone
if(!params.distCurve) {
  path.lineTo((params.distTailOd/2), params.proxTailLen+proxAngle+params.Length+distAngle)
} else {
path.arc(-((params.Diameter/2)-(params.distTailOd/2)-(params.radius)), 0, (params.Diameter/2)-(params.distTailOd/2)-(params.radius), 0, Math.PI/2, false);
path.arc(0, params.radius, -params.radius, Math.PI/2, 0,true);
}
//Distal Tail
path.lineTo(params.distTailOd/2,params.proxTailLen+proxAngle+params.Length+distAngle+params.distTailLen)
// Non/semi .0015 double to .006 
// Complaint .0008 up to .010

// the lathe object, initially it is just a box
// but will be soon replaced by a lathe

var lathe = new THREE.Mesh(
		new THREE.BoxGeometry( 1, 1, 1 ),
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

function changeThickness( WT )
{
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
        var proxTailLimit = params.proxTailLen + params.radius + proxAngle;
        var offset = 0;
        var position = path.getPoint(i/n, v)["y"];
        if(params.proxCurve || params.distCurve) { var offSet = params.radius}
        if(params.distCurve && params.proxCurve) { var offSet = params.radius*1.5}
        var distTailLimit = params.proxTailLen  + proxAngle + params.Length;
        //Handle Proximal Radius Taper
        if(position >= params.proxTailLen && position <= proxTailLimit){
          
				points.push( v.addScaledVector(t,-params.proxTailWT-decreaseFactor).clone() );
        decreaseFactor += -((params.proxTailWT - params.WT)/(proximalTaperDistance+1))
          
          
		    } 
        
        //Handle Distal Radius Taper
				else if(position >= distTailLimit && position <= distTailLimit+ distAngle){
          
				points.push( v.addScaledVector(t,-params.WT-(increaseFactor)).clone() );
        increaseFactor += ((params.distTailWT - params.WT)/(distalTaperDistance+1))
          
				} 
      
        //Handle Thickness of Proximal Tail
        else if(position <= proxTailLimit){
        //Should WT be different at each tail? If So, this needs to be broken into two statements.
        points.push( v.addScaledVector(t,-params.proxTailWT).clone() )
        } 
        
        //Handle Thickness of Distal Tail
        else if(position >= distTailLimit){
        //Should WT be different at each tail? If So, this needs to be broken into two statements.
        points.push( v.addScaledVector(t,-params.distTailWT).clone() )
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
		lathe.geometry.dispose();
		lathe.geometry = new THREE.LatheGeometry( points, 40, 0, Math.PI*2 );
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

createShape(Math.PI*2);


function animationLoop( t )
{
    controls.update( );
		light.position.copy( camera.position );
    renderer.render( scene, camera );
}





$("#spherical").on('change', function() {
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


function takeScreenshot() {
  var bg = scene.getObjectByName( "bg" );
  bg.visible = false;
renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
        var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      
      a.href = url;
      a.download = 'balloon.png';
      a.click();
    }, 'image/png', 1.0);
  bg.visible = true;
}

function sendScreenshot() {
  var bg = scene.getObjectByName( "bg" );
  bg.visible = false;
renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
        var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
          //console.log(url.substr(url.indexOf(',')+1));
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
$("#submit").hover(function(){
sendScreenshot(); 
});




function exportBinary() {
  var bg = scene.getObjectByName( "bg" );
  bg.visible = false;
  var obj = scene.getObjectByName( "obj" );
  obj.rotation.x = 0;
				const result = exporter.parse( obj, { binary: true } );
				saveArrayBuffer( result, 'balloon.stl' );
  obj.rotation.x = 6;
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
