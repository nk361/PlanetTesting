export function vertexShader() {//executes per vertex
    return `
        varying float amplitudeScale;
        varying float noiseVal;
        varying float totalVertexNoise;
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
        
        float mountainousNoise(vec3 v)//returns a value between -1.0 and 1.0
        {
            return (2.0 * (1.0 - abs(snoise(vec3(v.x, v.y, v.z)))) - 1.0);
        }
        
        float magnitude(vec3 end)
        {
            //if(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0) > 0.0)
                return sqrt(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0));//center needs to affect both direction (unit vector) and height (magnitude)
            //else
                //return -sqrt(abs(pow(end.x - center.x, 2.0) + pow(end.y - center.y, 2.0) + pow(end.z - center.z, 2.0)));
        }
        
        vec3 unitVector(vec3 end)//assumed center is delta variable center, doesn't need returned with end point
        {
            float mag = magnitude(end);
            return vec3((end.x - center.x) / mag, (end.y - center.y) / mag, (end.z - center.z) / mag);//center needs to affect both direction (unit vector) and height (magnitude)
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
            
            float moveSpeed = delta / 25.0;
            float scaleFrequency = 0.3;
            
            //I THINK SIMPLEX NOISE ACTUALLY RETURNS VALUES FROM -1 to 1
            //noiseVal = (2.0 * (1.0 - abs(snoise(vec3((pos.x + moveSpeed) * scaleFrequency, (pos.y + moveSpeed) * scaleFrequency, (pos.z + moveSpeed) * scaleFrequency)))) - 1.0);// / 5.0; //the last division is to scale the noise amplitude and the delta division is to slow the speed of movement
            //noiseVal = snoise(vec3(pos.x + moveSpeed, pos.y + moveSpeed, pos.z + moveSpeed));
            
            //noiseVal = snoise(vec3((pos.x + moveSpeed) * scaleFrequency, (pos.y + moveSpeed) * scaleFrequency, (pos.z + moveSpeed) * scaleFrequency));
            //noiseVal = mountainousNoise(vec3((pos.x + moveSpeed) * scaleFrequency, (pos.y + moveSpeed) * scaleFrequency, (pos.z + moveSpeed) * scaleFrequency));
            
            const int noiseLayers = 6;
            float layerFrequencyChange = 0.8;
            float totalNoiseVal = 0.0;
            float totalHeight = 0.0;
            float currentLayerAmplitude = 0.3;//decrease over time for smaller detail
            float layerPositionMoveBy = 5.0;
            for(int i = 0; i < noiseLayers; i++)
            {
                totalNoiseVal += currentLayerAmplitude * mountainousNoise(vec3((pos.x + moveSpeed * float(i)) * scaleFrequency, (pos.y + moveSpeed * float(i)) * scaleFrequency, (pos.z + moveSpeed * float(i)) * scaleFrequency));
                totalHeight += 1.0 * currentLayerAmplitude;//before changing it, also, only using 1.0 for the positive half of the range. Use -totalHeight for the mirrored, negative possible range
                currentLayerAmplitude *= 0.5;//be sure not to let this value become zero or no layer will be added
                scaleFrequency *= 1.8;
                
                //TODO OH the lowest is actually the bare minimum value of all noise layers added up, but that's very unlikely, the color range is working
                
                //totalHeight += 2.0 * scaleFrequency;//before changing it
                //scaleFrequency *= layerFrequencyChange;
                //moveSpeed *= layerFrequencyChange;
            }
            
            noiseVal = smoothstep(-totalHeight, totalHeight, totalNoiseVal);//TODO I should keep track of all the changes made to the amplitude and the amounts added in layers to figure out the max and min values and use them with smoothstep to make NoiseVal 0 - 1 or -1 to 1 always
            
            //float noiseVal = rand(pos.z);
            
            //amplitudeScale = 3.0;//divided by the number here to scale down, while color value multiplied in fragment shader sot scale up for better color range
            //float maxNoiseVal = 1.0 / amplitudeScale;//min is 0 max depends on amplitude changes
            
            //noiseVal /= amplitudeScale;//scale the amplitude
            
            //totalVertexNoise = noiseVal;//TODO add all the current vertex noise layers to this for coloring in the fragment shader
            //Will probably need to track the max possible value after all layers are added
            
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
        varying float totalVertexNoise;
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
        
        //vec3[4] colors = vec3[](0.5, 0.5, 0.5);
        //int a[4] = int[4](4, 2, 0, 5, 1);
        
        const int colorAmount = 7;
        vec3 myColors[colorAmount];//cannot initialize inline as far as I know
        vec3 snowColor = vec3(224.0 / 255.0, 224.0 / 255.0, 224.0 / 255.0);//can't use a function to do these conversions because global vars need constant values
        vec3 mountainColor = vec3(128.0 / 255.0, 128.0 / 255.0, 128.0 / 255.0);
        vec3 mountainBaseColor = vec3(153.0 / 255.0, 76.0 / 255.0, 0.0 / 255.0);
        vec3 grassColor = vec3(0.0 / 255.0, 153.0 / 255.0, 0.0 / 255.0);
        vec3 dirtColor = vec3(153.0 / 255.0, 76.0 / 255.0, 0.0 / 255.0);
        vec3 sandColor = vec3(255.0 / 255.0, 255.0 / 255.0, 153.0 / 255.0);
        vec3 waterColor = vec3(51.0 / 255.0, 51.0 / 255.0, 255.0 / 255.0);
        
        vec3 colorFromNoise(float min, float max, float noiseVal)
        {
            myColors[6] = snowColor;
            myColors[5] = mountainColor;
            myColors[4] = mountainBaseColor;
            myColors[3] = grassColor;
            myColors[2] = dirtColor;
            myColors[1] = sandColor;
            myColors[0] = waterColor;
            
            float noiseInRange = noiseVal;//smoothstep(min, max, noiseVal);//figure out where the value should be in the range of 0 to 1
            
            //I need to get the left and right indexes of the colors based on the current noiseInRange value
            //noiseInRange / (1.0 / colorAmount)
            //const int index = int(noiseInRange / (1.0 / float(colorAmount)));//I think this code would work without the const array index restriction
            //return mix(myColors[index], myColors[index + 1], noiseInRange * (1.0 / float(colorAmount)));
            
            vec3 currentColor = vec3(0.0, 0.0, 0.0);
            
            for(int i = 0; i < colorAmount - 1; i++)
                if(((1.0 / float(colorAmount - 1) * float(i)) < noiseInRange) && ((1.0 / float(colorAmount - 1) * float(i + 1)) > noiseInRange))
                    currentColor = mix(myColors[i], myColors[i + 1], smoothstep((1.0 / float(colorAmount - 1) * float(i)), (1.0 / float(colorAmount - 1) * float(i + 1)), noiseInRange));
            
            return currentColor;
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
            
            //float single = noiseVal;// * amplitudeScale;
            
           
            //float single = magnitude(pos) / ((radius * 100.0));//the first number reduces the radius to 0 and the second number reduces the noise value added to the radius to 0
            //vec3 color = vec3(single, single, single);
        
            //vec3 color = colorFromNoise(0.0 - 1.0, 1.0 + 0.7, single);//TODO I really need to figure this range out
            //vec3 color = colorFromNoise(0.0 - 1.3, 1.0 + 4.3, single);//TODO I really need to figure this range out
            vec3 color = colorFromNoise(0.0, 1.0, noiseVal/*single*/);//TODO I really need to figure this range out
        
            gl_FragColor = vec4(color, 1.0);//rgba used to set the color of the current pixel, currently all red
            
            //I wonder what other gl variables you can set
            
            //I'll need to set the color based on the y value in the position and maybe some other cool patterns to try
        }
    `
}