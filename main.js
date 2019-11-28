// Mainly from https://github.com/ncase/sight-and-light 

// Find intersection of RAY & SEGMENT
function getIntersection(ray,segment) {
	// RAY in parametric: Point + Delta*T1
	let r_px = ray.a.x;
	let r_py = ray.a.y;
	let r_dx = ray.b.x-ray.a.x;
	let r_dy = ray.b.y-ray.a.y;
	// SEGMENT in parametric: Point + Delta*T2
	let s_px = segment.a.x;
	let s_py = segment.a.y;
	let s_dx = segment.b.x-segment.a.x;
	let s_dy = segment.b.y-segment.a.y;
	// Are they parallel? If so, no intersect
	let r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
	let s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
	if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag) {
		// Unit vectors are the same.
		return null;
	}
	// SOLVE FOR T1 & T2
	// r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
	// ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
	// ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
	// ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
	let T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
	let T1 = (s_px+s_dx*T2-r_px)/r_dx;
	// Must be within parametic whatevers for RAY/SEGMENT
	if(T1<0) return null;
	if(T2<0 || T2>1) return null;
	// Return the POINT OF INTERSECTION
	return {
		x: r_px+r_dx*T1,
		y: r_py+r_dy*T1,
		param: T1
	};
}

// DRAWING
let canvas = document.getElementById("canvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let ctx = canvas.getContext("2d");
function draw() {
	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// // Draw segments
	// ctx.strokeStyle = "#999";
	// for(let i=0;i<segments.length;i++) {
	// 	let seg = segments[i];
	// 	ctx.beginPath();
	// 	ctx.moveTo(seg.a.x,seg.a.y);
	// 	ctx.lineTo(seg.b.x,seg.b.y);
	// 	ctx.stroke();
	// }
	// Get all unique points
	let points = (segments => {
		let a = [];
		segments.forEach(seg => { a.push(seg.a,seg.b); });
		return a;
	})(segments);
	let uniquePoints = (points => {
		let set = {};
		return points.filter(p => {
			let key = p.x+","+p.y;
			if (key in set) {
				return false;
			} else {
				set[key]=true;
				return true;
			}
		});
	})(points);
	// Get all angles
	let uniqueAngles = [];
	for(let j=0;j<uniquePoints.length;j++) {
		let uniquePoint = uniquePoints[j];
		let angle = Math.atan2(uniquePoint.y-Mouse.y,uniquePoint.x-Mouse.x);
		uniquePoint.angle = angle;
		uniqueAngles.push(angle-0.00001,angle,angle+0.00001);
	}
	// RAYS IN ALL DIRECTIONS
	let intersects = [];
	for(let j=0;j<uniqueAngles.length;j++) {
		let angle = uniqueAngles[j];
		// Calculate dx & dy from angle
		let dx = Math.cos(angle);
		let dy = Math.sin(angle);
		// Ray from center of screen to mouse
		let ray = {
			a:{x:Mouse.x,y:Mouse.y},
			b:{x:Mouse.x+dx,y:Mouse.y+dy}
		};
		// Find CLOSEST intersection
		let closestIntersect = null;
		for(let i=0;i<segments.length;i++) {
			let intersect = getIntersection(ray,segments[i]);
			if(!intersect) continue;
			if(!closestIntersect || intersect.param<closestIntersect.param) {
				closestIntersect=intersect;
			}
		}
		// Intersect angle
		if(!closestIntersect) continue;
		closestIntersect.angle = angle;
		// Add to list of intersects
		intersects.push(closestIntersect);
	}
	// Sort intersects by angle
	intersects = intersects.sort((a, b) => a.angle - b.angle);
	// DRAW AS A GIANT POLYGON
	ctx.fillStyle = "#111";
	ctx.beginPath();
	ctx.moveTo(intersects[0].x,intersects[0].y);
	for(let i=1;i<intersects.length;i++) {
		let intersect = intersects[i];
		ctx.lineTo(intersect.x,intersect.y);
	}
	ctx.fill();
	// // DRAW DEBUG LINES
	// ctx.strokeStyle = "#f55";
	// for(let i=0;i<intersects.length;i++) {
	// 	let intersect = intersects[i];
	// 	ctx.beginPath();
	// 	ctx.moveTo(Mouse.x,Mouse.y);
	// 	ctx.lineTo(intersect.x,intersect.y);
	// 	ctx.stroke();
	// }
}

// LINE SEGMENTS
let segments = [
	// Border
	{a:{x:0,y:0}, b:{x:canvas.width,y:0}},
	{a:{x:canvas.width,y:0}, b:{x:canvas.width,y:canvas.height}},
	{a:{x:canvas.width,y:canvas.height}, b:{x:0,y:canvas.height}},
	{a:{x:0,y:canvas.height}, b:{x:0,y:0}},
	// Polygon #1
	{a:{x:100,y:150}, b:{x:120,y:50}},
	{a:{x:120,y:50}, b:{x:200,y:80}},
	{a:{x:200,y:80}, b:{x:140,y:210}},
	{a:{x:140,y:210}, b:{x:100,y:150}},
	// Polygon #2
	{a:{x:100,y:200}, b:{x:120,y:250}},
	{a:{x:120,y:250}, b:{x:60,y:300}},
	{a:{x:60,y:300}, b:{x:100,y:200}},
	// Polygon #3
	{a:{x:200,y:260}, b:{x:220,y:150}},
	{a:{x:220,y:150}, b:{x:300,y:200}},
	{a:{x:300,y:200}, b:{x:350,y:320}},
	{a:{x:350,y:320}, b:{x:200,y:260}},
	// Polygon #4
	{a:{x:340,y:60}, b:{x:360,y:40}},
	{a:{x:360,y:40}, b:{x:370,y:70}},
	{a:{x:370,y:70}, b:{x:340,y:60}},
	// Polygon #5
	{a:{x:450,y:190}, b:{x:560,y:170}},
	{a:{x:560,y:170}, b:{x:540,y:270}},
	{a:{x:540,y:270}, b:{x:430,y:290}},
	{a:{x:430,y:290}, b:{x:450,y:190}},
	// Polygon #6
	{a:{x:400,y:95}, b:{x:580,y:50}},
	{a:{x:580,y:50}, b:{x:480,y:150}},
	{a:{x:480,y:150}, b:{x:400,y:95}}
];

// DRAW LOOP
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
let updateCanvas = true;
function drawLoop() {
  requestAnimationFrame(drawLoop);
  if (updateCanvas) {
    draw();
    updateCanvas = false;
  }
}
window.onload = function() {
	drawLoop();
};

// MOUSE	
let Mouse = {
	x: canvas.width/2,
	y: canvas.height/2
};
canvas.onmousemove = function(event) {	
	Mouse.x = event.clientX;
	Mouse.y = event.clientY;
	updateCanvas = true;
};