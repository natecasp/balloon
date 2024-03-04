import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
console.clear();
var sandbox = document.getElementById('sandbox');
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, sandbox.offsetWidth / sandbox.offsetHeight, .1, 1000);
camera.position.set(-3, 5, 80).setLength(50);
let renderer = new THREE.WebGLRenderer({
  antialias: true
});
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
let light = new THREE.DirectionalLight(0xffffff, 2);
let light2= new THREE.DirectionalLight(0xffffff, 2);
const amb = new THREE.AmbientLight( 0x404040 );
scene.add( amb );
light2.position.setScalar(-1);
light.position.setScalar(1);
scene.add(light2);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));
const gui = new GUI();
const params = {
 Diameter: 4,
 Length: 30,
 distConeAng: 45,
 distTailOd: 1,
 distTailLen: 10,
 proxConeAng: 45,
 proxTailOd: 1,
 proxTailLen: 10,
 proxCurve: false,
 distCurve: false
}

const folder = gui.addFolder( 'Body' );
const diameterController = folder.add( params, 'Diameter', 1, 38, .01).onChange( createShape );   
const lengthController = folder.add( params, 'Length', 0, 180, .1).onChange( createShape );
folder.open();

const distalFolder = gui.addFolder( 'Distal End' );
const distalConeController = distalFolder.add( params, 'distConeAng', 3, 90, 1).name('Distal Cone Angle').onChange( createShape );
const distalTailOdController = distalFolder.add( params, 'distTailOd', 0, 4, .01).name('Distal Tail OD').onChange( createShape );
const distalTailLenController = distalFolder.add( params, 'distTailLen', 2, 50, .01).name('Distal Tail Length').onChange( createShape );
const distalCurveController = distalFolder.add( params , 'distCurve').name('Rounded').onChange(createShape);
distalFolder.open();

const proximalFolder = gui.addFolder( 'Proximal End' );
const proximalConeController = proximalFolder.add( params, 'proxConeAng', 3, 90, 1).name('Proximal Cone Angle').onChange( createShape );
const proximalTailOdController = proximalFolder.add( params, 'proxTailOd', 0, 4, .01).name('Proximal Tail OD').onChange( createShape );
const proximalTailLenController = proximalFolder.add( params, 'proxTailLen', 2, 50, .01).name('Proximal Tail Length').onChange( createShape );
const proximalCurveController = proximalFolder.add( params , 'proxCurve').name('Rounded').onChange(createShape);
proximalFolder.open();

function createShape(){
if($("#unit-2").val() == 'mm'){
camera.position.set(-3, 5, 20).setLength(Math.max((params.Length*1.4), 50));
} else {
camera.position.set(-3, 5, 20).setLength(Math.max((params.Length*1), 3));
}
var distAngle = Number((((params.Diameter)/2)*Math.tan((90-params.distConeAng) * Math.PI/180)));
var proxAngle = Number((((params.Diameter)/2)*Math.tan((90-params.proxConeAng) * Math.PI/180)));
var len = params.Length;
let g = new THREE.CylinderGeometry( params.Diameter, params.Diameter, len, 64, 15, true );
let distalCone = new THREE.CylinderGeometry( params.Diameter, params.distTailOd, distAngle, 64, 1, true );
let distalTail = new THREE.CylinderGeometry( params.distTailOd, params.distTailOd, params.distTailLen, 64, 1, true );
let proximalCone = new THREE.CylinderGeometry( params.proxTailOd, params.Diameter, proxAngle, 64, 1, true );
let proximalTail = new THREE.CylinderGeometry( params.proxTailOd, params.proxTailOd, params.proxTailLen, 64, 1, true );
let m = new THREE.MeshStandardMaterial({color: "#8ac1c3", roughness: .3,transparent:false, opacity: 1});
m.side = THREE.BackSide;
m.side = THREE.DoubleSide;

var previous = scene.getObjectByName( "obj" );
if (previous != "") {
scene.remove(previous);
            }
let curve = new THREE.Shape()
curve.absarc(params.proxTailOd, 0, (params.Diameter-params.proxTailOd), 0, Math.PI/2 );
var points = curve.getSpacedPoints( 20 );
const proxCurve = new THREE.LatheGeometry( points, 64 );
let dCurve = new THREE.Shape();
dCurve.absarc(params.distTailOd, 0, (params.Diameter-params.distTailOd), (Math.PI*3)/2, 0 );
var points = dCurve.getSpacedPoints( 20 );
const distCurve = new THREE.LatheGeometry( points, 64 );
let o = new THREE.Mesh(g, m);
let dTail = new THREE.Mesh(distalTail, m);
if(params.distCurve === true) {
var dCone = new THREE.Mesh(distCurve, m);
dCone.position.set(0,-((len/2) ), 0)
dTail.position.set(0,-((len/2)+(params.distTailLen/2)+(params.Diameter-params.distTailOd)),0)
} else {
var dCone = new THREE.Mesh(distalCone, m);
dCone.position.set(0,-((len/2) +(distAngle/2)), 0);
dTail.position.set(0,-((len/2)+(distAngle)+(params.distTailLen/2)),0)
}

let pTail = new THREE.Mesh(proximalTail, m);
if(params.proxCurve === true){
  var pCone = new THREE.Mesh(proxCurve, m)
  pCone.position.set(0,((len/2) ), 0)
  pTail.position.set(0,((len/2)+(params.proxTailLen/2)+(params.Diameter-params.proxTailOd)),0)
} else{ 
var pCone = new THREE.Mesh(proximalCone, m);
pCone.position.set(0,((len/2) +(proxAngle/2)), 0)
pTail.position.set(0,((len/2)+(proxAngle)+(params.proxTailLen/2)),0)
}
o.geometry.center();
o.material.shading = THREE.SmoothShading;
const obj = new THREE.Object3D();

obj.name = "obj";
obj.add(o);
obj.add(dCone);
obj.add(dTail);
obj.add(pTail);
obj.add(pCone);
  //ROT
obj.rotation.x = 6;
scene.add(obj);

}
createShape(1);
let clock = new THREE.Clock();

renderer.setAnimationLoop((_) => {
  let t = clock.getElapsedTime();
  var obj = scene.getObjectByName( "obj" );
  scene.rotation.y += 0.002;
  controls.update();
  renderer.render(scene, camera);
});
//LEN
$("#len-range").on('input', function() {
lengthController.setValue(this.value);
$("#LEN").val(this.value);
});
$("#LEN").on('change', function() {
lengthController.setValue(this.value);
$("#len-range").val(this.value);
});
//DWT
$("#wall-range").on('input', function() {
$("#DWT").val(this.value);
});
$("#DWT").on('change', function() {
$("#wall-range").val(this.value);
});
//DIA
$("#diameter-range").on('input', function() {
diameterController.setValue(Number(this.value));
$("#DIAMETER").val(this.value);
$("#distalid-range,#DIST-ID,#proximalid-range,#PROX-ID").attr({"min": this.value/15, "max": this.value});
if($("#distalid-range").val() < this.value/15) { $("#distalid-range,#DIST-ID").val(this.value/15); distalTailOdController.setValue(Number(this.value/15)); }
if($("#proximalid-range").val() < this.value/15) { $("#proximalid-range,#PROX-ID").val(this.value/15); proximalTailOdController.setValue(Number(this.value/15));}

});
$("#DIAMETER").on('change', function() {
diameterController.setValue(Number(this.value));
$("#diameter-range").val(this.value);
});

//DISTAL ID
$("#distalid-range").on('input', function() {
distalTailOdController.setValue(Number(this.value));
$("#DIST-ID").val(this.value);
var pid = $("#proximalid-range").val();
$("#diameter-range,#DIAMETER").attr("min", Math.max(this.value, pid));
if(this.value > $("#diameter-range").val()) {diameterController.setValue(this.value);$("#diameter-range,#DIAMETER").val(this.value);}
});
$("#DIST-ID").on('change', function() {
distalTailOdController.setValue(Number(this.value));
$("#distalid-range").val(this.value);
});

//PROXIMAL ID
$("#proximalid-range").on('input', function() {
$("#PROX-ID").val(this.value);
proximalTailOdController.setValue(Number(this.value));
var did = $("#distalid-range").val();
$("#diameter-range,#DIAMETER").attr("min", Math.max(this.value, did));
if(this.value > $("#diameter-range").val()) {diameterController.setValue(this.value);$("#diameter-range,#DIAMETER").val(this.value);}
});
$("#PROX-ID").on('change', function() {
proximalTailOdController.setValue(Number(this.value));
$("#proximalid-range").val(this.value);
});

//D NECK
$("#distalneck-range").on('input', function() {
distalTailLenController.setValue(this.value);
$("#DIST-NECK").val(this.value);
});
$("#DIST-NECK").on('change', function() {
distalTailLenController.setValue(this.value);
$("#distalneck-range").val(this.value);
});
//P NECK
$("#proximalneck-range").on('input', function() {
proximalTailLenController.setValue(this.value);
$("#PROX-NECK").val(this.value);
});
$("#PROX-NECK").on('change', function() {
proximalTailLenController.setValue(this.value);
$("#proximalneck-range").val(this.value);
});

//DISTAL CONE
$("#distalcone-range").on('input', function() {
distalConeController.setValue(this.value);
$("#DIST-CONE").val(this.value);
//LENGTH VALIDATION
if ($("#unit-2").val() == 'mm') {var maxLength = 180;} else { var maxLength = 7.08;};
if((Number($("#len-range").val())+distAngle+proxAngle) > maxLength) {
var newBody = maxLength - distAngle - proxAngle;
$("#LEN,#len-range").val(maxLength);
lengthController.setValue(maxLength);
}
});
$("#DIST-CONE").on('change', function() {
distalConeController.setValue(this.value);
$("#distalcone-range").val(this.value);
//LENGTH VALIDATION
if ($("#unit-2").val() == 'mm') {var maxLength = 180;} else { var maxLength = 7.08;};
if((Number($("#len-range").val())+distAngle+proxAngle) > maxLength) {
var newBody = maxLength - distAngle - proxAngle;
$("#LEN,#len-range").val(maxLength);
lengthController.setValue(maxLength);
}
});

//PROXIMAL CONE
$("#proximalcone-range").on('input', function() {
proximalConeController.setValue(this.value);
$("#PROX-CONE").val(this.value);
//LENGTH VALIDATION
if ($("#unit-2").val() == 'mm') {var maxLength = 180;} else { var maxLength = 7.08;};
if((Number($("#len-range").val())+distAngle+proxAngle) > maxLength) {
var newBody = maxLength - distAngle - proxAngle;
$("#LEN,#len-range").val(maxLength);
lengthController.setValue(maxLength);
}
});
$("#PROX-CONE").on('change', function() {
proximalConeController.setValue(this.value);
$("#proximalcone-range").val(this.value);
//LENGTH VALIDATION
if ($("#unit-2").val() == 'mm') {var maxLength = 180;} else { var maxLength = 7.08;};
if((Number($("#len-range").val())+distAngle+proxAngle) > maxLength) {
var newBody = maxLength - distAngle - proxAngle;
$("#LEN,#len-range").val(maxLength);
lengthController.setValue(maxLength);
}
});


//D ROUND
$("#distal-round").on('change', function() {
if($(this).is(':checked')){
distalCurveController.setValue(true);
$("#distalcone-range,#DIST-CONE").css('display', 'none');
} else {distalCurveController.setValue(false);
$("#distalcone-range,#DIST-CONE").css('display', 'block');
}
});
//P ROUND
$("#proximal-round").on('change', function() {
if($(this).is(':checked')){
proximalCurveController.setValue(true);
$("#proximalcone-range,#PROX-CONE").css('display', 'none');
} else {
proximalCurveController.setValue(false);
$("#proximalcone-range,#PROX-CONE").css('display', 'block');
}
});

//UNITS

$("#unit-2").on('change', function() {
  if(this.value == 'in') {
    //LENGTH
    var newLen = Number($("#len-range").val()) / 25.4;
    console.log($("#len-range").attr("min"));
    $("#LEN,#len-range").attr({
      "min": Number($("#len-range").attr("min"))/25.4,
      "max": Number($("#len-range").attr("max"))/25.4,
      "step": Number($("#len-range").attr("step"))/25.4
    });
    console.log($("#len-range").attr("min"));
    $("#LEN,#len-range").val(newLen);
    lengthController.setValue(newLen);
    
    //DWT
    var newDWT = Number($("#wall-range").val()) / 25.4;
    $("#DWT,#wall-range").attr({
     "min": Number($("#wall-range").attr("min"))/25.4,
      "max": Number($("#wall-range").attr("max"))/25.4,
      "step": Number($("#wall-range").attr("step"))/25.4
    });
    $("#DWT,#wall-range").val(newDWT);

    //DIAMETER
    var newDiameter = Number($("#diameter-range").val()) / 25.4;
    $("#DIAMETER,#diameter-range").attr({
      "min": Number($("#diameter-range").attr("min"))/25.4,
      "max": Number($("#diameter-range").attr("max"))/25.4,
      "step": Number($("#diameter-range").attr("step"))/25.4
    });
    $("#DIAMETER,#diameter-range").val(newDiameter);
    diameterController.setValue(newDiameter);

    //DISTAL ID
    var newDistalId = Number($("#distalid-range").val()) / 25.4;
    $("#DIST-ID,#distalid-range").attr({
      "min": Number($("#distalid-range").attr("min"))/25.4,
      "max": Number($("#distalid-range").attr("max"))/25.4,
      "step": Number($("#distalid-range").attr("step"))/25.4
    });
    $("#DIST-ID,#distalid-range").val(newDistalId);
    distalTailOdController.setValue(newDistalId);

    //PROXIMAL ID
    var newProximalId = Number($("#proximalid-range").val()) / 25.4;
    $("#PROX-ID,#proximalid-range").attr({
      "min": Number($("#proximalid-range").attr("min"))/25.4,
      "max": Number($("#proximalid-range").attr("max"))/25.4,
      "step": Number($("#proximalid-range").attr("step"))/25.4
    });
    $("#PROX-ID,#proximalid-range").val(newProximalId);
    proximalTailOdController.setValue(newProximalId);

    //PROXIMAL NECK
    var newProximalNeck = Number($("#proximalneck-range").val()) / 25.4;
    $("#PROX-NECK,#proximalneck-range").attr({
      "min": Number($("#proximalneck-range").attr("min"))/25.4,
      "max": Number($("#proximalneck-range").attr("max"))/25.4,
      "step": Number($("#proximalneck-range").attr("step"))/25.4
    });
    $("#PROX-NECK,#proximalneck-range").val(newProximalNeck);
    proximalTailLenController.setValue(newProximalNeck);

    //DISTAL NECK
    var newDistalNeck = Number($("#distalneck-range").val()) / 25.4;
    $("#DIST-NECK,#distalneck-range").attr({
      "min": Number($("#distalneck-range").attr("min"))/25.4,
      "max": Number($("#distalneck-range").attr("max"))/25.4,
      "step": Number($("#distalneck-range").attr("step"))/25.4
    });
    $("#DIST-NECK,#distalneck-range").val(newDistalNeck);
    distalTailLenController.setValue(newDistalNeck);

  } else {
    //LENGTH
    var newLen = Number($("#len-range").val()) * 25.4;
    $("#LEN,#len-range").attr({
      "min": Number($("#len-range").attr("min"))*25.4,
      "max": Number($("#len-range").attr("max"))*25.4,
      "step": Number($("#len-range").attr("step"))*25.4
    });
    $("#LEN,#len-range").val(newLen);
    lengthController.setValue(newLen);
    
    //DWT
    var newDWT = Number($("#wall-range").val()) * 25.4;
    $("#DWT,#wall-range").attr({
     "min": Number($("#wall-range").attr("min"))*25.4,
      "max": Number($("#wall-range").attr("max"))*25.4,
      "step": Number($("#wall-range").attr("step"))*25.4
    });
    $("#DWT,#wall-range").val(newDWT);

    //DIAMETER
    var newDiameter = Number($("#diameter-range").val()) * 25.4;
    $("#DIAMETER,#diameter-range").attr({
      "min": Number($("#diameter-range").attr("min"))*25.4,
      "max": Number($("#diameter-range").attr("max"))*25.4,
      "step": Number($("#diameter-range").attr("step"))*25.4
    });
    $("#DIAMETER,#diameter-range").val(newDiameter);
    diameterController.setValue(newDiameter);

    //DISTAL ID
    var newDistalId = Number($("#distalid-range").val()) * 25.4;
    $("#DIST-ID,#distalid-range").attr({
      "min": Number($("#distalid-range").attr("min"))*25.4,
      "max": Number($("#distalid-range").attr("max"))*25.4,
      "step": Number($("#distalid-range").attr("step"))*25.4
    });
    $("#DIST-ID,#distalid-range").val(newDistalId);
    distalTailOdController.setValue(newDistalId);

    //PROXIMAL ID
    var newProximalId = Number($("#proximalid-range").val()) * 25.4;
    $("#PROX-ID,#proximalid-range").attr({
      "min": Number($("#proximalid-range").attr("min"))*25.4,
      "max": Number($("#proximalid-range").attr("max"))*25.4,
      "step": Number($("#proximalid-range").attr("step"))*25.4
    });
    $("#PROX-ID,#proximalid-range").val(newProximalId);
    proximalTailOdController.setValue(newProximalId);

    //PROXIMAL NECK
    var newProximalNeck = Number($("#proximalneck-range").val()) * 25.4;
    $("#PROX-NECK,#proximalneck-range").attr({
      "min": Number($("#proximalneck-range").attr("min"))*25.4,
      "max": Number($("#proximalneck-range").attr("max"))*25.4,
      "step": Number($("#proximalneck-range").attr("step"))*25.4
    });
    $("#PROX-NECK,#proximalneck-range").val(newProximalNeck);
    proximalTailLenController.setValue(newProximalNeck);

    //DISTAL NECK
    var newDistalNeck = Number($("#distalneck-range").val()) * 25.4;
    $("#DIST-NECK,#distalneck-range").attr({
      "min": Number($("#distalneck-range").attr("min"))*25.4,
      "max": Number($("#distalneck-range").attr("max"))*25.4,
      "step": Number($("#distalneck-range").attr("step"))*25.4
    });
    $("#DIST-NECK,#distalneck-range").val(newDistalNeck);
    distalTailLenController.setValue(newDistalNeck);

  }
});
