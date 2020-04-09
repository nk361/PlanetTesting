export function vertexShader() {//executes per vertex
    return `
        varying float amplitudeScale;
        varying float noiseVal;
        varying vec3 pos;//varying sends this to the fragment shader, a position to let the color change related to it
        uniform float delta;
        uniform float radius;
        uniform vec3 center;
        
        //\tSimplex 3D Noise 
        //\tby Ian McEwan, Ashima Arts
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        
        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;
        
        // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
        
          //  x0 = x0 - 0. + 0.0 * C 
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;
        
        // Permutations
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        
        // Gradients
        // ( N*N points uniformly over a square, mapped onto an octahedron.)
          float n_ = 1.0/7.0; // N=7
          vec3  ns = n_ * D.wyz - D.xzx;
        
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
        
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
        
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
        
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
        
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
        
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
        
        //Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
        
        // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }
        
        float magnitude(vec3 end)
        {
            //if(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0) > 0.0)
                return sqrt(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0));
            //else
                //return -sqrt(abs(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0)));
        }
        
        vec3 unitVector(vec3 end)//assumed center is delta variable center, doesn't need returned with end point
        {
            float mag = magnitude(end);
            return vec3((center.x + end.x) / mag, (center.y + end.y) / mag, (center.z + end.z) / mag);
        }
        
        float rand(float x)
        {
            return fract(sin(x)*1.0);
        }
        
        void main()
        {
            pos = position;
            //pos = unitVector(position) * vec4(radius, radius, radius, 1.0);//I AM NOT SURE IF THIS IS CORRECT, ESPECIALLY THE UNIT VECTOR FROM CHANGED CENTER not set up in the other file yet
            
            //so in here, I need to send in the center as a delta variable and use the pos varying variable to get the unit vector (direction)
            //then I need to multiply the unit vector by the magnitude of the original vector + the value given by noise
            //I'm not sure what parts below need applied to the final position given
            
            //oh it just becomes pos I think? might need to set position to it too
            
            float changeBy = delta / 15.0;
            
            noiseVal = snoise(vec3(pos.x + changeBy, pos.y + changeBy, pos.z + changeBy));// / 5.0; //the last division is to scale the noise amplitude and the delta division is to slow the speed of movement
            //float noiseVal = rand(pos.z);
            
            amplitudeScale = 3.0;//divided by the number here to scale down, while color value multiplied in fragment shader sot scale up for better color range
            float maxNoiseVal = 1.0 / amplitudeScale;//min is 0 max depends on amplitude changes
            
            noiseVal /= amplitudeScale;//scale the amplitude
            
            vec4 modelViewPosition = modelViewMatrix * ((vec4(position + unitVector(pos) * vec3(noiseVal, noiseVal, noiseVal), 1.0)));//position is the position of the vertex while the modelViewMatrix is the position of the model in the scene
            gl_Position = projectionMatrix * modelViewPosition;// + unitVector(pos);// * vec4(rand(noiseVal * 10.0), rand(noiseVal * 10.0), rand(noiseVal * 10.0), 1.0);// * vec4(radius, radius, radius, 1.0);//using the camera position to get the camera's relationship to the model in the scene, gl_Position is the exact vertex position in our scene
            
            //I think I need this set if I rely on it in the fragment shader
            //pos = vec3(gl_Position.x, gl_Position.y, gl_Position.z);//this is needed to update pos for use in the fragment shader based on the new heights instead of the original sphere heights
        }
    `
}

export function fragmentShader() {//executes per pixel
    return `
        varying float amplitudeScale;
        varying float noiseVal;
        varying vec3 pos;//varying sends this to the fragment shader, a position to let the color change related to it
        uniform float delta;//I think this is current time for use in animation changes
        uniform float radius;
        uniform vec3 center;
        
        float magnitude(vec3 end)
        {
            //if(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0) > 0.0)
                return sqrt(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0));
            //else
                //return -sqrt(abs(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0)));
        }
        
        //  Function from Iñigo Quiles
        //  https://www.shadertoy.com/view/MsS3Wc
        vec3 hsb2rgb( in vec3 c ){
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                     6.0)-3.0)-1.0,
                                     0.0,
                                     1.0);
            rgb = rgb*rgb*(3.0-2.0*rgb);
            return c.z * mix(vec3(1.0), rgb, c.y);
        }
        
        void main()
        {
            //float red = (1.0 + cos(pos.x + delta)) / 2.0;
            //float green = (1.0 + cos(pos.y + delta)) / 2.0;
            //float blue = (1.0 + cos(pos.z + delta)) / 2.0;
        
            // We map x (0.0 - 1.0) to the hue (0.0 - 1.0)
            // And the y (0.0 - 1.0) to the brightness
            //vec3 color = hsb2rgb(vec3(magnitude(pos) * 5.0 + delta / 15.0,1.0,1.0));//changed y to 1.0 to keep only colors and replaced x with y to change from horizontal to vertical, subtracted delta for movement direction
            
            //now I have the generated noise value per vertex that I could color based on, but, vertex shader is per vertex and fragment is per pixel, I don't know if that'll be a problem
            //having the noiseval passed in lets me work with it directly instead of trying to derive it from the magnitude from the center coords
            
            float single = noiseVal * amplitudeScale;
            
            //float single = magnitude(pos) / ((radius * 100.0));//the first number reduces the radius to 0 and the second number reduces the noise value added to the radius to 0
            vec3 color = vec3(single, single, single);
        
            gl_FragColor = vec4(color, 1.0);//rgba used to set the color of the current pixel, currently all red
            
            //I wonder what other gl variables you can set
            
            //I'll need to set the color based on the y value in the position and maybe some other cool patterns to try
        }
    `
}