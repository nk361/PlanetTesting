import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';
import {Vector3D} from "./Vector3D.js";
import {vertexShader, fragmentShader} from "./Shaders.js";

function main() {
    const canvas = document.querySelector('#mainCanvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    const fov = 75;
    const aspect = 2;//the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;

    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const planet = new THREE.Geometry();

    let vertices = [];

    //I need to plan out the shapes, the triangle pattern, and the surface area that won't cause a gap
    //A = 4 * pi * r^2 is the formula for surface area

    //If I split the surface into 12 slices for example, each slice needs triangles that are largest in the center and get smaller toward the edges, with one side smaller than the other

    //are the sections on the slice spaced equally?

    //I may be able to make a sphere out of equal size triangles if I can figure out the appropriate size
    //which, really it should just be the surface area divided by the amount of triangles?

    //Start with an icosahedron and keep in mind that for every triangle, it can be replaced by 4 more equal sized triangles
    //it's pretty much a die with 20 faces
    //20 is divisible by 4, which makes me think a shape is possible with 5 triangles, all of equal size
    //although I couldn't see a polyhedron online with equal sides, I think it is possible

    //let triangles = 20;

    //so each triangle's center is the radius away from the center of the sphere, the points of the triangle are further than the radius away from the center
    //I just recently saw a video on how to find the center of a triangle, so I need to reverse that kind of math to find the points from the center
    //to find the points from the center though, I probably need to know the size of the triangle
    //maybe there's a trick like slicing the shape to see the 2D sides

    //the surface area of the triangle is the surface area of the whole shape divided by the amount of sides
    //the formula to find the surface area of one with 20 sides is 5 * (edge length)^2 * sqrt(3)
    //I think edge length and radius are the same

    //I was wrong, no polyhedron made of equal triangles with 5 sides

    //so edges of the triangles are the radius in length, the surface area can then be found with this info, which means I can divide that by 20 to get the area of the triangles
    //which allows me to find the center or in reverse, can help me find the points of the triangle from the center

    //if I am going to find the triangles by using the center point method though, I'll need a way to find the centers at an equal distance away from each other on a sphere

    //I keep seeing a diagram using 3 flat planes to find the points of the triangles and I think that might be the easiest way?
    //So I may try that first instead

    let largerLeg = 2.0;
    let smallerLeg = largerLeg / 2;
    let hypotenuse = Math.sqrt(Math.pow(largerLeg, 2) + Math.pow(smallerLeg, 2));//using the leg lengths for the first iteration positions and hypotenuse as the radius of the circumsphere

    //TODO well, when adding the new vertices, I want them to be the radius distance away from the center, but they are represented with an x, y, and z coord
    //TODO this means I have to use available information to generate that information
    //I think I have the hypotenuse, the height of the current triangle being added and the start point
    //wait!
    //TODO could it be as easy as picking out the points on the triangle before it is 3D and then extending the radius length out?
    //If I know the height of the current smaller triangles I am trying to make and given the points of the current triangle, I should be able to generate all those points
    //actually, the problem still remains, once I have the points generated, the way to move them outward by the radius will require trigonometry to split the info into coords
    //Maybe I need to act as if the new point is on a 2D circle that the triangle point is on and use cartesian coordinates to rotate the radius there?
    //Yes! I'd just need the radius and angle of the first point to add the angle and then to convert the cartesian coords to polar
    //the angle of the triangle point is on a 90 degree triangle with known distances, so I can figure out the angle at the center for use with cartesian coords
    //Math.atan(smallerLeg / largerLeg);//using arctan on opposite over adjacent can yield the result of the angle of the current triangle point
    //using the generated angle plus the given distance of the hypotenuse

    let center = new THREE.Vector3(0, 0, 0);

    //maybe if I could do a pair of two triangles, move them down once per strip, and do this 5 times, I could generate the shape in a way that would be easier to subdivide?
    //well, I am smart enough to really take any face info and use them indexes in the vertices list to generate new vertices and faces no matter what order the faces were added
    //but it is true that the current way that I'm generating the first iteration face info is a mess, pretty much hard coded really

    //need 12 to make 20 faces
    vertices.push([ largerLeg, smallerLeg, 0 ]);//x plane
    vertices.push([ largerLeg, -smallerLeg, 0 ]);
    vertices.push([ -largerLeg, smallerLeg, 0 ]);
    vertices.push([ -largerLeg, -smallerLeg, 0 ]);

    vertices.push([ 0, largerLeg, smallerLeg ]);//y plane
    vertices.push([ 0, largerLeg, -smallerLeg ]);
    vertices.push([ 0, -largerLeg, smallerLeg ]);
    vertices.push([ 0, -largerLeg, -smallerLeg ]);

    vertices.push([ smallerLeg, 0, largerLeg ]);//z plane
    vertices.push([ -smallerLeg, 0, largerLeg ]);
    vertices.push([ smallerLeg, 0, -largerLeg ]);
    vertices.push([ -smallerLeg, 0, -largerLeg ]);

    //planet.vertices = vertices;

    let faces = [];
    let one;
    let two;
    let three;

    for(let i = 0; i < 3; i++) {//three planes so 12 triangles at their ends
        one = (0 + 4 * i) % 12;
        two = (1 + 4 * i) % 12;
        three = (8 + 4 * i) % 12;
        faces.push([ one, two, three ]);

        one = (0 + 4 * i) % 12;
        two = (1 + 4 * i) % 12;
        three = (10 + 4 * i) % 12;
        faces.push([ one, three, two ]);

        one = (2 + 4 * i) % 12;
        two = (3 + 4 * i) % 12;
        three = (9 + 4 * i) % 12;
        faces.push([ one, three, two ]);

        one = (2 + 4 * i) % 12;
        two = (3 + 4 * i) % 12;
        three = (11 + 4 * i) % 12;
        faces.push([ one, two, three ]);
    }

    for(let i = 0; i < 2; i++) {//8 triangles remain between
        one = (0 + 3 * i) % 12;//handles 0, 8, 4 and 3, 7, 11
        two = (4 + 3 * i) % 12;
        three = (8 + 3 * i) % 12;
        faces.push([ one, two + (1 - i) * 4, three - (1 - i) * 4]);
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (0 + 3 * i) % 12;//handles 0, 5, 10 and 3, 9, 6
        two = (5 + -1 * i + i * 5) % 12;
        three = (10 + 1 * i - i * 5) % 12;
        faces.push([ one, two, three]);
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (1 + 1 * i);//handles 8, 1, 6 and 2, 11, 5
        two = (6 - 1 * i + 6 * i);
        three = (8 + 3 * i - 6 * i);
        faces.push([ one, two, three ]);
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (1 + 1 * i);//handles 1, 10, 7 and 2, 4, 9
        two = (7 - 3 * i + 3 * (1 - i));
        three = (10 - 1 * i - 3 * (1 - i));
        faces.push([ one, two, three ]);
        //console.log(planet.faces[planet.faces.length - 1]);
    }

    //points are added in threes per face and the total amount of faces can be found with 20 * 3 ^ i with the current iteration found with (20 * 3 ^ i) - (20 * 3 ^ (i - 1)) where i is NOT zero
    //to navigate from close point to close point, the changing factor for the index is the iteration the point was generated in added to the current index of the overall points
    //TODO remember that starting with 20 faces does not mean starting with 20 points, I have 12 points to start with and add 3 per face, per iteration

    let iterations = 8;//TODO when applying noise to the points, I have to use the amount of iterations to figure out where close points are since older points are closer to the start and newer points are closer to he end
    for(let i = 0; i < iterations; i++) {
        let frozenFacesLength = faces.length;
        for(let j = 0; j < frozenFacesLength; j++) {
            //everything is clockwise!//TODO I think faces are counter clockwise by default in documentation, so maybe I messed up the order earlier?
            //current face is faces[j] with points accessible as vertices[faces[j][0]], vertices[faces[j][1]], and vertices[faces[j][2]]
            let vec1 = new Vector3D(vertices[faces[j][0]][0], vertices[faces[j][0]][1], vertices[faces[j][0]][2]);//point 1
            let vec2 = new Vector3D(vertices[faces[j][1]][0], vertices[faces[j][1]][1], vertices[faces[j][1]][2]);//point 2
            let vec3 = new Vector3D(vertices[faces[j][2]][0], vertices[faces[j][2]][1], vertices[faces[j][2]][2]);//point 3

            //to get the midpoint vector = radius * unit vector of vec1 + vec2 assuming center is currently origin
            let midpointVector1 = (new Vector3D(hypotenuse)).multiply(vec1.add(vec2).unitVector());//middle right
            let midpointVector2 = (new Vector3D(hypotenuse)).multiply(vec2.add(vec3).unitVector());//bottom middle
            let midpointVector3 = (new Vector3D(hypotenuse)).multiply(vec3.add(vec1).unitVector());//middle left

            //add new points only
            vertices.push([ midpointVector1.x, midpointVector1.y, midpointVector1.z ]);//middle right
            vertices.push([ midpointVector2.x, midpointVector2.y, midpointVector2.z ]);//bottom middle
            vertices.push([ midpointVector3.x, midpointVector3.y, midpointVector3.z ]);//middle left

            //reuse old vertices and face data mixed with new data
            faces.push([ vertices.length - 1 - 2, vertices.length - 1 - 1, faces[j][1] ]);//bottom right
            faces.push([ vertices.length - 1 - 2, vertices.length - 1 - 0, vertices.length - 1 - 1 ]);//middle upside down
            faces.push([ vertices.length - 1 - 0, faces[j][2], vertices.length - 1 - 1 ]);//bottom left
            faces[j] = [ faces[j][0], vertices.length - 1 - 0, vertices.length - 1 - 2 ];//top, change original after using old data on other faces
        }
    }

    //TODO so I think the fastest and best way to add noise is using the vertex shader
    //TODO I'll need to use the current vertex point info as a vector from the center vector 3 and add to the magnitude of the vector by the generated noise value
    //TODO or do I need to somehow get the distance back and add it to the radius here?
    //TODO or do I need to generate the shape entirely inside the vertex shader somehow and not here at all?
    //the vertex shader executes per vertex, so whatever code in there needs to be designed to only relate to that single, current point
    //TODO maybe pass in the radius and center, and try to project the current vertex along the direction between the center and current vertex by the amount given by the noise algorithm
    //TODO test that the vector math is correct when doing this by moving the planet to another location and seeing that the surface moves to the new location
    //TODO get the point the same way as before, get the unit vector for the direction and then move the point out by the radius + noise value
    //TODO there might be a simpler way of just adding the noise value, but not sure yet nope, I checked online

    //need this down here because vertices and faces are both being generated based on previous data
    //this line still needs to come before setting the face data in the mesh though
    //planet.vertices = vertices;
    for(let i = 0; i < vertices.length; i++)//calling new here for both faces and vertices prevents calling new on vertices and faces that I remove when generating new info
        planet.vertices.push(new THREE.Vector3(vertices[i][2], vertices[i][1], vertices[i][0]));//TODO swapping the first and last put all the vertices in the correct orientation to apply noise

    //planet.faces = faces;
    for(let i = 0; i < faces.length; i++)
        planet.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));

    planet.translate(center.x, center.y, center.z);//move the points here, all at once to make it so much easier

    //planet.computeFaceNormals();//for lighting on phong material

    //console.log(hypotenuse);

    function makePlanetInstance(planet, color, x) {
        let uniforms = {
            delta: {value: 0},
            radius: {value: hypotenuse},
            center: {value: center}
        };

        //const material = new THREE.MeshBasicMaterial({color, wireframe: true});//old current

        //const material = new THREE.MeshPhongMaterial({color});
        //const material = new THREE.ShaderMaterial({color});//this somehow makes red

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader()
        });

        const plnt = new THREE.Mesh(planet, material);
        scene.add(plnt);

        plnt.position.x = x;
        return plnt;
    }

    const planets = [
        makePlanetInstance(planet, 0x44FF44, 0)
    ];

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        planets.forEach((plnt, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed / 2;
            //plnt.rotation.x = rot;
            plnt.rotation.y = rot / 4;
            //plnt.rotation.z = rot;
            if(plnt.material.uniforms.delta.value > 100.53)//closest to 1 from cos(delta) to make the animation loop because cos(0) is 1
                plnt.material.uniforms.delta.value = 0.0;
            else
                plnt.material.uniforms.delta.value += 0.05;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();