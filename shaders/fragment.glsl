uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D bg;
uniform sampler2D mask;

uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
void main() {
	vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
	// vec4 t = texture2D(bg, newUV);
	vec4 masky = texture2D(mask, vUv);

	float strength = masky.a * masky.r;

	strength*= 6.;

	strength = min(1., strength);

	vec4 t = texture2D(bg,newUV + ( 1. - strength) * 0.1);


	gl_FragColor = t * strength;
	// gl_FragColor.a *= masky.a;
 

}