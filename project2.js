/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {


	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		this.colorLoc = gl.getUniformLocation(this.prog, 'color');
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
	
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
	
		this.numTriangles = 0;
	
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
		this.eyePosLoc = gl.getUniformLocation(this.prog, 'eyePos');
		// TASK 4
		this.showTex2Loc = gl.getUniformLocation(this.prog, 'showTex2');
		this.textureBlendLoc = gl.getUniformLocation(this.prog, 'textureBlend');
		this.tex2Loc = gl.getUniformLocation(this.prog, 'tex2');
	
		this.isLightingEnabled = false;
		this.ambientIntensity = 0.2; // Default ambient light intensity
		this.specularIntensity = 1.0; // Default specular light intensity
		this.shininess = 20.0; // Default shininess exponent
		// TASK 4
		this.showTextureFlag = true;
		this.showTexture2Flag = false;
		this.textureBlend = 0.5; 
	}



	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
	
		this.numTriangles = vertPos.length / 3;
	}
	


	draw(trans) {
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);
	
		// Position attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
	
		// Texture coordinate attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		// Normal attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
	
		// Set lighting uniforms
		gl.uniform1i(this.enableLightingLoc, this.isLightingEnabled);
		gl.uniform1f(this.ambientLoc, this.ambientIntensity);
		gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
		gl.uniform1f(this.shininessLoc, this.shininess);
	
		// TASK 4
	    // Set texture uniforms
		gl.uniform1i(this.showTexLoc, this.showTextureFlag);
		gl.uniform1i(this.showTex2Loc, this.showTexture2Flag);
		gl.uniform1f(this.textureBlendLoc, this.textureBlend);
	
	    // Bind the first texture
		if (this.texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.uniform1i(this.texLoc, 0);
		}
		
		// Bind the second texture
		if (this.texture2) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texture2);
			gl.uniform1i(this.tex2Loc, 1);
		}

		// Update light and eye positions
		updateLightPos();
		gl.uniform3f(this.lightPosLoc, lightX, lightY, 1.0);
	
		// Assume the camera is at (0, 0, 1) for simplicity
		gl.uniform3f(this.eyePosLoc, 0.0, 0.0, 1.0);
	
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
	


	setSpecularLightIntensity(specularIntensity) {
		this.specularIntensity = specularIntensity;
	}
	
	setShininess(shininess) {
		this.shininess = shininess;
	}

	
	
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
	
		// Set the texture image data.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);
	
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}
	
	// TASK 4
	setTexture2(img) {
		const texture2 = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
	
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	
		this.texture2 = texture2;
	}


	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	// TASK 4
	showTexture2(show) {
		this.showTexture2Flag = show;
	}


	enableLighting(show) {
		this.isLightingEnabled = show;
	}
	
	setAmbientLight(ambient) {
		this.ambientIntensity = ambient;
	}

	// TASK 4
	setTextureBlend(blend) {
		this.textureBlend = blend;
	}
	
}



function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}



function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}



// Vertex shader source code
const meshVS = `
attribute vec3 pos; 
attribute vec2 texCoord; 
attribute vec3 normal;

uniform mat4 mvp; 

varying vec2 v_texCoord; 
varying vec3 v_normal; 
varying vec3 v_position;

void main()
{
    v_texCoord = texCoord;
    v_normal = normal;
    v_position = pos;

    gl_Position = mvp * vec4(pos,1);
}
`;


// Fragment shader source code
const meshFS = `
precision mediump float;

uniform bool showTex;
uniform bool showTex2;
uniform sampler2D tex;
uniform sampler2D tex2;
uniform float textureBlend;

uniform bool enableLighting;
uniform vec3 color; 
uniform vec3 lightPos;
uniform vec3 eyePos;
uniform float ambient;
uniform float specularIntensity;
uniform float shininess;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_position;

void main()
{
    vec4 baseColor;
    if(showTex){
        baseColor = texture2D(tex, v_texCoord);
    } else {
        baseColor = vec4(1.0, 0.0, 0.0, 1.0); // Default color
    }

    if(showTex2){
        vec4 tex2Color = texture2D(tex2, v_texCoord);
        // Blend the two textures based on the blending factor
        baseColor.rgb = mix(baseColor.rgb, tex2Color.rgb, textureBlend);
    }

    if(enableLighting){
        vec3 N = normalize(v_normal);
        vec3 L = normalize(lightPos - v_position);
        vec3 V = normalize(eyePos - v_position);
        vec3 R = reflect(-L, N);

        float diffuse = max(dot(N, L), 0.0);
        float specAngle = max(dot(R, V), 0.0);
        float specular = pow(specAngle, shininess) * specularIntensity;

        vec3 ambientComponent = ambient * baseColor.rgb;
        vec3 diffuseComponent = diffuse * baseColor.rgb;
        vec3 specularComponent = specular * vec3(1.0, 1.0, 1.0);

        vec3 finalColor = ambientComponent + diffuseComponent + specularComponent;
        finalColor = clamp(finalColor, 0.0, 1.0);

        gl_FragColor = vec4(finalColor, baseColor.a);
    } else {
        gl_FragColor = baseColor;
    }
}
`;


var lightX = 1;
var lightY = 1;
var lightZ = 1; // Assuming Z position is needed

const keys = {};
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function updateLightPos() {
    const translationSpeed = 0.1;
    if (keys['ArrowUp']) lightY += translationSpeed;
    if (keys['ArrowDown']) lightY -= translationSpeed;
    if (keys['ArrowRight']) lightX += translationSpeed;
    if (keys['ArrowLeft']) lightX -= translationSpeed;
}
	
///////////////////////////////////////////////////////////////////////////////////