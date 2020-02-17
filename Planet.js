import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r112/build/three.module.js';

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

    let radius = 2.5;
    let center = new THREE.Vector3(0, 0, 0);
    //need 12 ot make 20 faces
    vertices.push(new THREE.Vector3(center.x + radius, center.y + radius / 2, center.z));//x plane
    vertices.push(new THREE.Vector3(center.x + radius, center.y - radius / 2, center.z));
    vertices.push(new THREE.Vector3(center.x - radius, center.y + radius / 2, center.z));
    vertices.push(new THREE.Vector3(center.x - radius, center.y - radius / 2, center.z));

    vertices.push(new THREE.Vector3(center.x, center.y + radius, center.z + radius / 2));//y plane
    vertices.push(new THREE.Vector3(center.x, center.y + radius, center.z - radius / 2));
    vertices.push(new THREE.Vector3(center.x, center.y - radius, center.z + radius / 2));
    vertices.push(new THREE.Vector3(center.x, center.y - radius, center.z - radius / 2));

    vertices.push(new THREE.Vector3(center.x + radius / 2, center.y, center.z + radius));//z plane
    vertices.push(new THREE.Vector3(center.x - radius / 2, center.y, center.z + radius));
    vertices.push(new THREE.Vector3(center.x + radius / 2, center.y, center.z - radius));
    vertices.push(new THREE.Vector3(center.x - radius / 2, center.y, center.z - radius));

    planet.vertices = vertices;

    //maybe if I could do a pair of two triangles, move them down once per strip, and do this 5 times, I could generate the shape in a way that would be easier to subdivide?

    let one;
    let two;
    let three;

    for(let i = 0; i < 3; i++) {//three planes so 12 triangles at their ends
        one = (0 + 4 * i) % 12;
        two = (1 + 4 * i) % 12;
        three = (8 + 4 * i) % 12;
        planet.faces.push(new THREE.Face3(one, two, three));

        one = (0 + 4 * i) % 12;
        two = (1 + 4 * i) % 12;
        three = (10 + 4 * i) % 12;
        planet.faces.push(new THREE.Face3(one, three, two));

        one = (2 + 4 * i) % 12;
        two = (3 + 4 * i) % 12;
        three = (9 + 4 * i) % 12;
        planet.faces.push(new THREE.Face3(one, three, two));

        one = (2 + 4 * i) % 12;
        two = (3 + 4 * i) % 12;
        three = (11 + 4 * i) % 12;
        planet.faces.push(new THREE.Face3(one, two, three));
    }

    for(let i = 0; i < 2; i++) {//8 triangles remain between //TODO sweep under the kitchen table and brush Roxy, go to Outback Steakhouse
        one = (0 + 3 * i) % 12;//handles 0, 8, 4 and 3, 7, 11
        two = (4 + 3 * i) % 12;
        three = (8 + 3 * i) % 12;
        planet.faces.push(new THREE.Face3(one, two + (1 - i) * 4, three - (1 - i) * 4));
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (0 + 3 * i) % 12;//handles 0, 5, 10 and 3, 9, 6
        two = (5 + -1 * i + i * 5) % 12;
        three = (10 + 1 * i - i * 5) % 12;
        planet.faces.push(new THREE.Face3(one, two, three));
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (1 + 1 * i);//handles 8, 1, 6 and 2, 11, 5
        two = (6 - 1 * i + 6 * i);
        three = (8 + 3 * i - 6 * i);
        planet.faces.push(new THREE.Face3(one, two, three));
        //console.log(planet.faces[planet.faces.length - 1]);

        one = (1 + 1 * i);//handles 1, 10, 7 and 2, 4, 9
        two = (7 - 3 * i + 3 * (1 - i));
        three = (10 - 1 * i - 3 * (1 - i));
        planet.faces.push(new THREE.Face3(one, two, three));
        //console.log(planet.faces[planet.faces.length - 1]);
    }


    /*console.log(planet.vertices[0]);
    console.log(planet.vertices[1]);
    console.log(planet.vertices[8]);
    console.log(planet.faces);*/

    planet.computeFaceNormals();//for lighting on phong material

    function makePlanetInstance(planet, color, x) {
        /*let uniforms = {
            delta: {value: 0}
        };*/

        //const material = new THREE.MeshBasicMaterial({color});
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