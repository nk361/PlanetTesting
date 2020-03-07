import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';
import {Vector3D} from "./Vector3D.js";

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

    let triangles = 20;

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

    let largerLeg = 2.5;
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
    vertices.push([ center.x + largerLeg, center.y + smallerLeg, center.z ]);//x plane
    vertices.push([ center.x + largerLeg, center.y - smallerLeg, center.z ]);
    vertices.push([ center.x - largerLeg, center.y + smallerLeg, center.z ]);
    vertices.push([ center.x - largerLeg, center.y - smallerLeg, center.z ]);

    vertices.push([ center.x, center.y + largerLeg, center.z + smallerLeg ]);//y plane
    vertices.push([ center.x, center.y + largerLeg, center.z - smallerLeg ]);
    vertices.push([ center.x, center.y - largerLeg, center.z + smallerLeg ]);
    vertices.push([ center.x, center.y - largerLeg, center.z - smallerLeg ]);

    vertices.push([ center.x + smallerLeg, center.y, center.z + largerLeg ]);//z plane
    vertices.push([ center.x - smallerLeg, center.y, center.z + largerLeg ]);
    vertices.push([ center.x + smallerLeg, center.y, center.z - largerLeg ]);
    vertices.push([ center.x - smallerLeg, center.y, center.z - largerLeg ]);

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

    for(let i = 0; i < 2; i++) {//8 triangles remain between //TODO sweep under the kitchen table and brush Roxy, go to Outback Steakhouse
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

    //before setting the faces to the geometric faces, this is where I would use the stored information to split and generate the smaller faces
    //I will also need to get rid of the current face data as I use it to replace it with the generated data

    //faces is now a 2D array so that I am not calling new on data that I will be replacing
    //so the current problem to solve, is, when given a flat triangle with the corners the radius away from the center,
    //how do I transform it into a curved surface of triangles with all their points the radius away from the center too?
    //along with removing the original face data used to make this curved surface

    //TODO WAIT I think I could do this in iterations, given three corner points, as long as I just always split it into 4 triangles with their points the radius away, it will work on any scale
    //but is it more efficient to do it like that? no
    //but, it would be better for performance later on to do it in pieces like that, sort of like a quadtree since it can load in sections
    //so I'll do it that way
    let iterations = 7;
    for(let i = 0; i < iterations; i++) {
        //let frozenVerticesLength = vertices.length;
        let frozenFacesLength = faces.length;
        for(let j = 0; j < frozenFacesLength; j++) {
            //keep in mind that current order the triangle points are given in the faces array has the correct drawing direction
            //So, I was thinking the technique I can use is to act as if the two of the original face points are on an arc of the same circle
            //I know the radius for that circle
            //but once I have the arc, I can pick the mid point or even multiple equally spaced apart points
            //and to get the points inside the current triangle face, I need to rotate that 2D arc from the original two points around one of the two points, and that can allow me to pick out the points I need
            //a guess at how much to rotate the arc would be for a point in the middle of the triangle face, it would be 60 / 2 degrees, since all angles on these triangles are 60 degrees
            //I don't think I need to worry about which direction to rotate the arc, because of the fact that all of the faces are being drawn in the correct orientation
            //So I think that means starting with the first two points should always mean I can safely turn inward to the triangle

            //the formula for finding the point at the middle of the arc is x = radius + sqrt(radius^2 - y^2) where y in the example was zero since they had theirs on the x axis
            //but for me, my y will be harder to computer, it is not half the y of the top and bottom point
            //maybe I could treat every triangle as if it is around the x axis, but I think that is inefficient and extra work

            //there is a general formula to use instead that uses some vector math
            //vector magnitude indicated by two lines on both sides ||AB|| I think seems to be just the length of the line

            //TODO Thinking of the shape of the divided face has made me realise that all points needed for it are on the outer edges
            //So I really just need the midpoints of the three outer edge arcs to make the faces

            //let firstRadicalPositive = true;
            //let secondRadicalPositive = true;

            //the formula is the same for x and y with the radical signs varying based on input conditions
            //2 * (midpoint x) = (+ or -)sqrt((radius + x1) * (radius + x2)) (+ or -) sqrt((radius - x1) * (radius - x2))
            //it seems like signs depend on what quadrant the starting points are in
            //no I think the signs are based on which quadrant the midpoint is in

            //what if I did just calculate the midpoints without caring about the signs and then rendered the mesh?
            //if it makes a mess, would I be able to fix the mess with some tampering?
            //it spoke of intercepts, but I think the site is wrong
            //TODO oh! the site I think is correct on the signs! It's just a case of default signs changing only if a certain condition is true

            //TODO I need to check for an x intercept by using the x and y values of the point to tell where it is, but I need to also keep in mind direction
            //for example, if the x is negative and y is positive of the first point and then the second point has a negative y and a positive x
            //if it went left, the x intercept is negative, if it went right, the intercept is positive

            //I can know based on the face point order that I will always be making the arc outward from the first point to the second, giving me the direction and the points to test for intercepts
            //what has my curiosity peaked is that there will be many triangles that have no intercepts simply because they're so small, but they shouldn't have the same signs as ones in other quadrants, right?
            //even though this is for a sphere, I will be treating every arc as if it is on a 2D circle
            //I guess by the one example they gave that has x intercepts, it should just be fine?

            //this proves that there are cases where there are x intercepts of all kinds, it also helps show the similarities in points which might help generate them better?
            /*console.log("Triangle: " + j);
            console.log("(" + vertices[faces[j][0]][0] + ", " + vertices[faces[j][0]][1] + ", " + vertices[faces[j][0]][2] + ")");
            console.log("(" + vertices[faces[j][1]][0] + ", " + vertices[faces[j][1]][1] + ", " + vertices[faces[j][1]][2] + ")");
            console.log("(" + vertices[faces[j][2]][0] + ", " + vertices[faces[j][2]][1] + ", " + vertices[faces[j][2]][2] + ")");*/

            //I know that the arc will always go clockwise from the first point by the order that I'll use the points
            //this information can help me figure out if it has an x intercept

            //If only clockwise and only x intercepts, I just need to check for arcs going from positive y to negative y with positive x values and arcs that have negative y to positive y with negative x value
            //I don't think I can have arcs that are opened outward on opposite sides of origin (0, 0, 0)
            //well, that's how things are currently, where the shape is centered around (0, 0, 0)
            //if the shape is moved enough, then these arcs can become outward facing, so I need to account for that

            //so, that essentially means the x values along with the direction from the y values will tell me which side of the x axis the arc has crossed over
            //why does the direction matter again? I guess I just need to use the y values to know if it crosses the x axis, then use the x values to figure out if it crossed on the negative or positive
            //but, both points can have a positive x value while the place it crosses barely goes left to become negative
            //how do I know the x intercept?

            //I'll need to use the center of the planet as the center of the circle in the circle equation and then calculate the x intercepts
            //Once I have the intercepts, I should probably store them and check whether they are in the current arc's path

            //I can use the direction information to know that an x intercept will be outward from the two current points on the clockwise side
            //also, I'll have to generate the x intercepts for every single triangle side on the sphere
            //if that turns out to be a lot to compute, there might be a way to store the info after one computation to look up for all other triangles with a side on the same circle

            //the formula of a circle is (x - h)^2 + (y - k)^2 = r^2 where (h, k) is the circle's center and r is radius
            //to get the x intercepts, set y = 0 and solve for x, do the opposite for y intercepts

            //x = sqrt(r^2 - (y - k)^2) + h//x intercepts
            //y = sqrt(r^2 - (x - h)^2) + k//y intercepts
            //because of the square root, there can be multiple solutions, a positive and negative

            //let leftXIntercept = -(Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(center.y + 40, 2))) + center.x + 40;//if there are no intercepts, this gives NaN because the second part is larger than the first part in the subtraction and the square root of a negative number is imaginary
            //let rightXIntercept = Math.sqrt(Math.pow(hypotenuse, 2) - Math.pow(center.y + 40, 2)) + center.x + 40;

            //console.log("Left: " + leftXIntercept + " Right: " + rightXIntercept);

            //now they are the same for all circles per iteration, just need to test now which arcs have them and which don't

            //if(vertices[faces[j][0]][1] >= 0 && vertices[faces[j][1]][1] <= 0) {//crossed the x axis clockwise
                //WAIT their circle was around point (0, 0) maybe because the signs matter depending on where the center is, not the actual x position?
                //well, this is for finding the midpoint, which the coordinates relative to (0, 0) are what I need, not relative to the circle's center
                //I think, signs are not based on where on the circle it is, but instead where it is on the grid

                //what if there wasn't an x intercept? what does the math return?
                //it gives NaN if there is no x intercept
                //TODO I should probably separate that math to check if the result is negative before square rooting to know that there just isn't an x intercept

                //If I figure out the midpoint in a 2D way using just x and y, I still need to figure out the z point of the midpoint which I hope is just half of their difference?
            //}
            //TODO
            //a vector from center to current point can be turned into a unit vector by dividing it by it's magnitude
            //this preserves the direction on a vector with a magnitude of one
            //I can use the other point's vector, doing the same, to combine it with the first unit vector to get the direction to the middle
            //then I just need to scale that unit vector with a magnitude of one to have a magnitude of the radius
            //which the end point of that final vector is what I need to record for the mesh
            //the start point is always the planet center

            //the distance between two points in three dimensions can be found with distance = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2) + pow(z2 - z1, 2))
            //vectors don't care about the planet center, add that info to the result

            let vec1 = new Vector3D(vertices[faces[j][0]][0], vertices[faces[j][0]][1], vertices[faces[j][0]][2]);//point 1
            let vec2 = new Vector3D(vertices[faces[j][1]][0], vertices[faces[j][1]][1], vertices[faces[j][1]][2]);//point 2
            let vec3 = new Vector3D(vertices[faces[j][2]][0], vertices[faces[j][2]][1], vertices[faces[j][2]][2]);//point 3
            let centerVector = new Vector3D(center.x, center.y, center.z);//TODO move this elsewhere so it is not created every single iteration

            //to get the midpoint vector = center + radius * unit vector of vec1 + vec2
            let midpointVector1 = centerVector.add((new Vector3D(hypotenuse)).multiply(vec1.add(vec2).unitVector()));
            let midpointVector2 = centerVector.add((new Vector3D(hypotenuse)).multiply(vec2.add(vec3).unitVector()));
            let midpointVector3 = centerVector.add((new Vector3D(hypotenuse)).multiply(vec3.add(vec1).unitVector()));

            /*console.log("vec1: " + vec1);
            console.log("vec2: " + vec2);
            console.log("vec1.add(vec2): " + vec1.add(vec2).toString());
            console.log("vec1.add(vec2).unitVector(): " + vec1.add(vec2).unitVector().toString());
            console.log("hypotenuse: " + hypotenuse);
            console.log("(new Vector3D(hypotenuse)).multiply(vec1.add(vec2).unitVector()): " + (new Vector3D(hypotenuse)).multiply(vec1.add(vec2).unitVector()).toString());*/

            //current face is faces[j] with points accessible as vertices[faces[j][0]], vertices[faces[j][1]], and vertices[faces[j][2]]

            //update old data
            //the first vertex of the original face can stay the same
            //vertices[faces[j][1]] = [ midpointVector1.x, midpointVector1.y, midpointVector1.z ];//middle left
            //vertices[faces[j][2]] = [ midpointVector3.x, midpointVector3.y, midpointVector3.z ];//middle right
            /*vertices[faces[j][1]][0] = midpointVector1.x;
            vertices[faces[j][1]][1] = midpointVector1.y;
            vertices[faces[j][1]][2] = midpointVector1.z;
            vertices[faces[j][2]][0] = midpointVector3.x;
            vertices[faces[j][2]][1] = midpointVector3.y;
            vertices[faces[j][2]][2] = midpointVector3.z;*/

            //the original face data does not need changed, the points have been updated in place

            //add new data
            //vertices.push([ vec1.x, vec1.y, vec1.z ]);//top
            vertices.push([ midpointVector1.x, midpointVector1.y, midpointVector1.z ]);//middle left
            vertices.push([ midpointVector3.x, midpointVector3.y, midpointVector3.z ]);//middle right
            //vertices.push([ vec2.x, vec2.y, vec2.z ]);//bottom left
            vertices.push([ midpointVector2.x, midpointVector2.y, midpointVector2.z ]);//bottom middle
            //vertices.push([ vec3.x, vec3.y, vec3.z ]);//bottom right

            //TODO wait, faces will reuse vertices so I don't want to push all the vertices every time and I don't want to use only newly added vertex indexes in the faces
            //So, I'll need to keep all the old vertexes and generate around them and not change them, but instead just change the faces
            //TODO the faces are in a clockwise order, the way I've loaded the points into vec1, 2, and 3 and midpoint1, 2, 3 are assuming counterclockwise order, making the left and right faces later be swapped
            //indexes in clockwise direction

            faces.push([ vertices.length - 1 - 2, vertices.length - 1 - 0, faces[j][1] ]);//bottom left
            faces.push([ vertices.length - 1 - 2, vertices.length - 1 - 1, vertices.length - 1 - 0 ]);//middle upside down
            faces.push([ vertices.length - 1 - 1, faces[j][2], vertices.length - 1 - 0 ]);//bottom right
            faces[j] = [ faces[j][0], vertices.length - 1 - 1, vertices.length - 1 - 2 ];//top, change original after using old data on other faces

            //if(j === 1)//I think the problem is that faces share vertices and I am changing the data, I can't alter the data in place it seems
                //break;

            //now I need to remove the used points and read them along with these points as new faces
            //I could maybe not remove the original points by giving the correct index for the face data, I'm not sure if that's a good idea though
            //it would leave the data organizes in a way that all the newest points are at the end and older points towards the start

            //let midpointVector1 = Vector3D(hypotenuse, hypotenuse, hypotenuse).multiply(vec1.add(vec2).divide(vec1.add(vec2).magnitude()));
            //let midpointVector2 = Vector3D(hypotenuse, hypotenuse, hypotenuse).multiply(vec2.add(vec3).divide(vec2.add(vec3).magnitude()));
            //let midpointVector3 = Vector3D(hypotenuse, hypotenuse, hypotenuse).multiply(vec3.add(vec1).divide(vec3.add(vec1).magnitude()));


        }
    }

    //need this down here because vertices and faces are both being generated based on previous data
    //this line still needs to come before setting the face data in the mesh though
    //planet.vertices = vertices;
    for(let i = 0; i < vertices.length; i++)//calling new here for both faces and vertices prevents calling new on vertices and faces that I remove when generating new info
        planet.vertices.push(new THREE.Vector3(vertices[i][0], vertices[i][1], vertices[i][2]));

    //planet.faces = faces;
    for(let i = 0; i < faces.length; i++)
        planet.faces.push(new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]));

    //so, I know that the vertices that are generated above this code are all the correct distance from the center
    //TODO oh no, I just realized I generated the vertices to be the radius out and half the radius in a direction, which means they are further than the radius out
    //TODO they are the hypotenuse length from the center on a right triangle with side lengths of radius and radius divided by two
    //TODO so basically, the radius should actually be changed or the variable name changed

    /*console.log(planet.vertices[0]);
    console.log(planet.vertices[1]);
    console.log(planet.vertices[8]);
    console.log(planet.faces);*/

    planet.computeFaceNormals();//for lighting on phong material

    function makePlanetInstance(planet, color, x) {
        /*let uniforms = {
            delta: {value: 0}
        };*/

        //const material = new THREE.MeshBasicMaterial({color, wireframe: true});
        const material = new THREE.MeshPhongMaterial({color});
        //const material = new THREE.ShaderMaterial({color});//this somehow makes red

        /*const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader()
        });*/

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
            plnt.rotation.x = rot;
            plnt.rotation.y = rot;
            plnt.rotation.z = rot;
            /*if(plnt.material.uniforms.delta.value > 100.53)//closest to 1 from cos(delta) to make the animation loop because cos(0) is 1
                plnt.material.uniforms.delta.value = 0.0;
            else
                plnt.material.uniforms.delta.value += 0.05;*/
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();