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
scene.add(camera)
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


$(".updater").on('input', function(e) {
const target = e.target.id.includes('RANGE') ? e.target.id :  e.target.id.replace('-RANGE','');
const pair = e.target.id.includes('RANGE') ? e.target.id.replace('-RANGE','') : e.target.id + '-RANGE';
	$('#'+pair).val($('#'+target).val());
});


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
  console.log('changing ' + JSON.stringify(params));
 
}
$(".updater").on('change', function() {
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

function createSphere() {
const spheregeometry = new THREE.SphereGeometry( 40, 32, 16 );
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

function createShape(){
const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
const cube = new THREE.Mesh( geometry, material ); 
scene.add( cube );
  
//PARAMETER MATH
//Hoop Ratio (diameter id / tail id)
var hoop = (params.Diameter - (params.WT*2)) / Math.min((params.proxTailOd - (params.proxTailWT*2)),(params.distTailOd - (params.distTailWT*2)))
console.log(hoop)
//END PARAMETER MATH
//camera.position.set(-3, 5, 20).setLength(Math.max((params.Length*1.4), 50));  
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
console.log(lathe)
obj.name = "obj";
obj.add(lathe)
  //ROTATION
//obj.rotation.x = 6;
scene.add(obj);

}

createShape();

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

function animationLoop( t )
{
    controls.update( );
		light.position.copy( camera.position );
    renderer.render( scene, camera );
}





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



//CREATE LINE
function createLine(){
var find = $(".line");
var lineItem = find.length +1
var MATERIAL = $("#MATERIAL").val();  
var DIAMETER = Number($("#DIAMETER").val());
var DIAMETER_TOL = Number($("#DIAMETER-TOL").val());
var LEN = Number($("#LEN").val());
var LEN_TOL = Number($("#LEN-TOL").val());
var DIST_CONE = Number($("#DIST-CONE").val());
var DIST_CONE_TOL = Number($("#DIST-CONE-TOL").val());
var DIST_OD = Number($("#DIST-OD").val());
var DIST_OD_TOL = Number($("#DIST-OD-TOL").val());
var DIST_WT = Number($("#DIST-WT").val());
var DIST_WT_TOL = Number($("#DIST-WT-TOL").val());
var DIST_NECK = Number($("#DIST-NECK").val());
var DIST_NECK_TOL = Number($("#DIST-NECK-TOL").val());
var PROX_CONE = Number($("#PROX-CONE").val());
var PROX_CONE_TOL = Number($("#PROX-CONE-TOL").val());
var PROX_OD = Number($("#PROX-OD").val());
var PROX_OD_TOL = Number($("#PROX-OD-TOL").val());
var PROX_WT = Number($("#PROX-WT").val());
var PROX_WT_TOL = Number($("#PROX-WT-TOL").val());
var PROX_NECK = Number($("#PROX-NECK").val());
var PROX_NECK_TOL = Number($("#PROX-NECK-TOL").val());
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
  

if($("#quantity-2").val() == 'More') {
  var quantity = $("#custom-quantity").val();
} else {
  var quantity = $("#quantity-2").val();
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
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+LEN+`" readonly></input></div>
    <div class="item"><p class="label">Diameter</p><input class="quote-input" id="l`+lineItem+`-diameter" value="`+DIAMETER+`" readonly></input></div>
  	<div class="item"><p class="label">DWT</p><input class="quote-input line-length" id="l`+lineItem+`-dwt" value="`+DWT+`" readonly></input></div>
    <div class="item"><p class="label">Distal OD</p><input class="quote-input" id="l`+lineItem+`-distal-od" value="`+DIST_OD+`" readonly></input></div>
    <div class="item"><p class="label">Distal WT</p><input class="quote-input" id="l`+lineItem+`-dist-wt" value="`+DIST_WT+`" readonly></input></div>
    <div class="item"><p class="label">Distal Neck Length</p><input class="quote-input" id="l`+lineItem+`-dist-neck" value="`+DIST_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Distal Cone</p><input class="quote-input" id="l`+lineItem+`-dist-cone" value="`+DIST_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Proximal OD</p><input class="quote-input" id="l`+lineItem+`-prox-od" value="`+PROX_OD+`" readonly></input></div>
    <div class="item"><p class="label">Proximal WT</p><input class="quote-input" id="l`+lineItem+`-prox-wt" value="`+PROX_WT+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Neck Length</p><input class="quote-input" id="l`+lineItem+`-prox-neck" value="`+PROX_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Cone</p><input class="quote-input" id="l`+lineItem+`-prox-cone" value="`+PROX_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+MATERIAL+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;"></input>
    <label class="label" `+ label +`><input type="checkbox" class="expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-len-tol" value="`+LEN_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Diameter Tol</p><input class="quote-input" id="l`+lineItem+`-diameter-tol" value="`+DIAMETER_TOL+`" readonly></input></div>
    <div class="item"><p class="label">DWT Tol</p><input class="quote-input" id="l`+lineItem+`-dwt-tol" value="`+DWT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal OD Tol</p><input class="quote-input" id="l`+lineItem+`-dist-od-tol" value="`+DIST_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal WT Tol</p><input class="quote-input" id="l`+lineItem+`-dist-wt-tol" value="`+DIST_WT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal Neck Tol</p><input class="quote-input" id="l`+lineItem+`-dist-neck-tol" value="`+DIST_NECK_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-dist-cone-tol" value="`+DIST_CONE_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal OD Tol</p><input class="quote-input" id="l`+lineItem+`-prox-od-tol" value="`+PROX_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal WT Tol</p><input class="quote-input" id="l`+lineItem+`-prox-wt-tol" value="`+PROX_WT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Neck Tol</p><input class="quote-input" id="l`+lineItem+`-prox-neck-tol" value="`+PROX_NECK_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-prox-cone-tol" value="`+PROX_CONE_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
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
		<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+LEN+`" readonly></input></div>
    <div class="item"><p class="label">Diameter</p><input class="quote-input" id="l`+lineItem+`-diameter" value="`+DIAMETER+`" readonly></input></div>
  	<div class="item"><p class="label">DWT</p><input class="quote-input line-length" id="l`+lineItem+`-dwt" value="`+DWT+`" readonly></input></div>
    <div class="item"><p class="label">Distal OD</p><input class="quote-input" id="l`+lineItem+`-distal-od" value="`+DIST_OD+`" readonly></input></div>
    <div class="item"><p class="label">Distal WT</p><input class="quote-input" id="l`+lineItem+`-dist-wt" value="`+DIST_WT+`" readonly></input></div>
    <div class="item"><p class="label">Distal Neck Length</p><input class="quote-input" id="l`+lineItem+`-dist-neck" value="`+DIST_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Distal Cone</p><input class="quote-input" id="l`+lineItem+`-dist-cone" value="`+DIST_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Proximal OD</p><input class="quote-input" id="l`+lineItem+`-prox-od" value="`+PROX_OD+`" readonly></input></div>
    <div class="item"><p class="label">Proximal WT</p><input class="quote-input" id="l`+lineItem+`-prox-wt" value="`+PROX_WT+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Neck Length</p><input class="quote-input" id="l`+lineItem+`-prox-neck" value="`+PROX_NECK+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Cone</p><input class="quote-input" id="l`+lineItem+`-prox-cone" value="`+PROX_CONE+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+MATERIAL+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;" checked></input>
    <label class="label" `+ label +`><input type="checkbox" class=" expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-len-tol" value="`+LEN_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Diameter Tol</p><input class="quote-input" id="l`+lineItem+`-diameter-tol" value="`+DIAMETER_TOL+`" readonly></input></div>
    <div class="item"><p class="label">DWT Tol</p><input class="quote-input" id="l`+lineItem+`-dwt-tol" value="`+DWT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal OD Tol</p><input class="quote-input" id="l`+lineItem+`-dist-od-tol" value="`+DIST_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal WT Tol</p><input class="quote-input" id="l`+lineItem+`-dist-wt-tol" value="`+DIST_WT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal Neck Tol</p><input class="quote-input" id="l`+lineItem+`-dist-neck-tol" value="`+DIST_NECK_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Distal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-dist-cone-tol" value="`+DIST_CONE_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal OD Tol</p><input class="quote-input" id="l`+lineItem+`-prox-od-tol" value="`+PROX_OD_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal WT Tol</p><input class="quote-input" id="l`+lineItem+`-prox-wt-tol" value="`+PROX_WT_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Neck Tol</p><input class="quote-input" id="l`+lineItem+`-prox-neck-tol" value="`+PROX_NECK_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Proximal Cone Tol</p><input class="quote-input" id="l`+lineItem+`-prox-cone-tol" value="`+PROX_CONE_TOL+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
  </div>
  </div>
</div>`;  
}
 
$("#quote").append(lineHtml);
storeHistory();
  

if (user.model.expand.blanket_po){
 
updateBlanket();
}
updateTotal();
}
//END CREATE LINE
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
